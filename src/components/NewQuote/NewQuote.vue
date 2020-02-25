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
        />
        <b-form-input
          class="new-quote-input-item"
          v-model="data.serialNum"
          placeholder="Serial Number"
          :state="serialNumValidation"
        />
        <b-form-input
          class="new-quote-input-item"
          v-model="data.attention"
          placeholder="Attention"
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
      :to="data.company"
      :att="data.attention"
      :re="data.regarding"
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
        date: null,
        attention: "",
        regarding: null,
        errorInPath: false,
        errorInParts: false,
        parts: null,
        company: null,
        quoteNumFromPath: null,
        quoteNumFromUser: null,
        quoteDesc: null,
        quoteDescFull: null,
        totalLines: null,
        filePath: null
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
        console.log(this.masterData);
        axios({
          method: "post",
          url: "http://localhost:5000/writefile",
          headers: {
            attention: this.masterData.attention,
            regarding: this.masterData.regarding,
            errorInPath: this.masterData.errorInPath,
            errorInParts: this.masterData.errorInParts,
            parts: this.masterData.parts,
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
      getMetaData(this.file.path).then(data => {
        this.initLoaded = true;

        this.masterData.company = data.company;
        this.masterData.errorInPath = data.errorInPath;
        this.masterData.quoteDesc = data.quoteDesc;
        this.masterData.quoteNumFromPath = data.quoteNum;

        this.data.company = this.masterData.company;
        this.data.quoteNum = this.masterData.quoteNumFromPath + "R";
        this.data.regarding = "Witte quote " + this.data.quoteNum;

        console.log(this.masterData);
      });
    },

    serialNumLogic() {
      if (
        this.serialNumValidation &&
        this.data.serialNum.length > 0 &&
        this.initLoaded
      ) {
        this.data.regarding =
          this.masterData.quoteDescFull + " for pump " + this.data.serialNum;
      } else {
        this.data.regarding = this.masterData.quoteDesc;
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
