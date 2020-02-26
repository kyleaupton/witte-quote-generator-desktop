<template>
  <div class="new-quote-main">
    <b-form-group>
      <b-form-text id="password-help-block">
        Start by selecting the quote from Germany.
      </b-form-text>
      <b-form-file
        v-model="file"
        :state="Boolean(file)"
        placeholder="Choose a file or drop it here..."
        drop-placeholder="Drop file here..."
        aria-describedby="password-help-block"
      />
    </b-form-group>

    <hr class="my-4" />

    <b-form-group inline class="new-quote-input-group">
      <b-form class="new-quote-input-group-form" inline>
        <b-form-input
          class="new-quote-input-item"
          v-model="data.quoteNum"
          placeholder="Quote Number"
          :state="quoteNumValidation"
          :disabled="masterData.errorInPath"
        />
        <b-form-input
          class="new-quote-input-item"
          v-model="data.serialNum"
          placeholder="Serial Number"
          :state="serialNumValidation"
          :disabled="masterData.errorInPath"
        />
        <b-form-input
          class="new-quote-input-item"
          v-model="data.attention"
          placeholder="Attention"
          :disabled="masterData.errorInPath"
        />
        <b-form-select
          class="new-quote-input-item"
          v-model="selectOptions.selected"
          :options="selectOptions.options"
        />
      </b-form>
    </b-form-group>

    <hr class="my-4" />

    <NewQuotePreview
      :date="data.date"
      :to="data.company"
      :att="data.attention"
      :re="data.regarding"
      :desc="data.quoteDescFull"
    />

    <hr class="my-4" />

    <b-form-group>
      <b-button
        class="new-quote-button"
        @click="handelGenerate"
        variant="outline-success"
        :disabled="generateButtonValidation"
        >Generate</b-button
      >
      <b-button
        class="new-quote-button"
        @click="handleCancel"
        variant="outline-secondary"
        >Cancel</b-button
      >
    </b-form-group>

    <b-modal id="bv-modal-example" hide-footer>
      <template v-slot:modal-title>
        Uh oh!
      </template>
      <div class="d-block text-center">
        <p>
          Looks like there's an error in pdf file's path. Please check the path
          and try again.
        </p>
      </div>
      <b-button class="mt-3" block @click="$bvModal.hide('bv-modal-example')"
        >Close</b-button
      >
    </b-modal>
  </div>
</template>

<script>
import NewQuotePreview from "./NewQuotePreview";
import { getParts } from "@/utils/pdf";
import { getMetaData } from "@/utils/quote";
import { writeXlsxFile } from "@/utils/xlsx";
import fs from "fs";
import axios from "axios";

export default {
  name: "NewQuote",

  components: {
    NewQuotePreview
  },

  data() {
    return {
      initLoaded: false,
      file: null,

      data: {
        date: "",
        company: "",
        attention: "",
        regarding: "",
        quoteNum: "",
        serialNum: "",
        quoteDescFull: ""
      },

      masterData: {
        date: "",
        attention: "",
        regarding: "",
        errorInPath: false,
        errorInParts: false,
        parts: null,
        company: "",
        quoteNumFromPath: "",
        quoteNumFromUser: "",
        quoteDesc: "",
        quoteDescFull: "",
        totalLines: "",
        filePath: ""
      },

      selectOptions: {
        selected: 0,
        options: [
          { value: 0, text: "Extra Lines: 0" },
          { value: 1, text: "Extra Lines: 1" },
          { value: 2, text: "Extra Lines: 2" },
          { value: 3, text: "Extra Lines: 3" },
          { value: 4, text: "Extra Lines: 4" },
          { value: 5, text: "Extra Lines: 5" },
          { value: 6, text: "Extra Lines: 6" },
          { value: 7, text: "Extra Lines: 7" },
          { value: 8, text: "Extra Lines: 8" },
          { value: 9, text: "Extra Lines: 9" },
          { value: 10, text: "Extra Lines: 10" }
        ]
      }
    };
  },

  watch: {
    file() {
      this.handleInit();
    },

    serialNumComputed() {
      this.serialNumLogic();
    },

    quoteNumComputed() {
      this.regardingLogic();
    }
  },

  computed: {
    quoteNumValidation() {
      let match = this.data.quoteNum.match(/\d\dQ\d\d\dR\d{1,2}$/);
      if (match) {
        return true;
      }
      return false;
    },

    serialNumValidation() {
      return (
        (this.data.serialNum.length === 5 && !isNaN(this.data.serialNum)) ||
        this.data.serialNum.length === 0
      );
    },

    generateButtonValidation() {
      if (
        (this.file && this.quoteNumValidation && this.serialNumValidation) ||
        this.masterData.errorInPath
      ) {
        return false;
      }
      return true;
    },

    serialNumComputed() {
      return this.data.serialNum;
    },

    quoteNumComputed() {
      return this.data.quoteNum;
    }
  },

  methods: {
    handleCancel() {
      this.$router.push("/");
    },

    handelGenerate() {
      this.masterData.quoteNumFromUser = this.data.quoteNum;
      const dataStream = fs.readFileSync(this.file.path);
      getParts(dataStream, this.file.path).then(data => {
        this.masterData.errorInParts = data.errorInParts;
        this.masterData.parts = data.parts;
        this.masterData.totalLines =
          data.parts.length + this.selectOptions.selected;
        this.masterData.quoteDescFull = this.data.quoteDescFull;
        console.log(this.masterData.parts);
        axios({
          method: "post",
          url: "http://localhost:5000/writefile",
          headers: {
            attention: this.masterData.attention,
            regarding: this.masterData.regarding,
            errorInPath: this.masterData.errorInPath,
            errorInParts: this.masterData.errorInParts,
            parts: JSON.stringify(this.masterData.parts),
            company: this.masterData.company,
            quoteNumFromPath: this.masterData.quoteNumFromPath,
            quoteNumFromUser: this.masterData.quoteNumFromUser,
            quoteDesc: this.masterData.quoteDesc,
            quoteDescFull: this.masterData.quoteDescFull,
            totalLines: this.masterData.totalLines,
            filePath: this.masterData.filePath
          }
        })
          .then(data => {
            console.log(data);
          })
          .catch(reason => {
            console.log(reason);
          });
      });
    },

    handleInit() {
      this.masterData.filePath = this.file.path;
      getMetaData(this.file.path).then(data => {
        this.initLoaded = true;

        if (data.errorInPath) {
          this.$bvModal.show("bv-modal-example");
        }

        this.masterData.company = data.company;
        this.masterData.errorInPath = data.errorInPath;
        this.masterData.quoteDesc = data.quoteDesc;
        this.masterData.quoteDescFull = data.quoteDesc;
        this.masterData.quoteNumFromPath = data.quoteNum;

        if (!data.errorInPath) {
          this.data.company = this.masterData.company;
          this.data.quoteNum = this.masterData.quoteNumFromPath + "R";
          this.masterData.regarding = "Witte quote " + this.data.quoteNum;
          this.data.regarding = "Witte quote " + this.data.quoteNum;
          this.data.quoteDescFull = this.masterData.quoteDesc;
          let today = new Date();
          let date =
            today.getMonth() +
            1 +
            "-" +
            today.getDate() +
            "-" +
            today.getFullYear();
          this.masterData.date = date;
          this.data.date = date;
        }

        console.log(this.masterData);
      });
    },

    serialNumLogic() {
      if (
        this.serialNumValidation &&
        this.data.serialNum.length > 0 &&
        this.initLoaded
      ) {
        this.data.quoteDescFull =
          this.masterData.quoteDescFull + " for pump " + this.data.serialNum;
      } else {
        this.data.quoteDescFull = this.masterData.quoteDescFull;
      }
    },

    regardingLogic() {
      if (this.initLoaded) {
        this.data.regarding = "Witte quote " + this.data.quoteNum;
      }
    },

    getWorkingDirectory() {}
  }
};
</script>

<style>
.new-quote-main {
  margin: 24px;
}

.new-quote-input-group-form {
  display: inline-block;
}

.new-quote-input {
  margin-bottom: 12px;
}

.new-quote-input-item {
  margin-right: 6px;
}

.new-quote-button {
  margin-right: 6px;
}
</style>
