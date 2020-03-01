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
          v-model="masterData.quoteNumFromUser"
          placeholder="Quote Number"
          :state="quoteNumValidation"
          :disabled="masterData.errorInPath"
        />
        <b-form-input
          class="new-quote-input-item"
          v-model="masterData.serialNum"
          placeholder="Serial Number"
          :state="serialNumValidation"
          :disabled="masterData.errorInPath"
        />
        <b-form-input
          class="new-quote-input-item"
          v-model="masterData.attention"
          placeholder="Attention"
          :disabled="masterData.errorInPath"
        />
        <b-form-select
          id="new-quote-extra-line"
          class="new-quote-input-item"
          v-model="selectOptions.selected"
          :options="selectOptions.options"
          :state="!errorInTotalLines"
        />
        <b-popover
          v-if="errorInTotalLines && initLoaded"
          target="new-quote-extra-line"
          triggers="hover"
          placement="bottom"
        >
          <template v-slot:title>Uh oh!</template>
          The maximum number of total lines supported is 25, please choose
          {{ 25 - masterData.parts.length }} lines or less.
        </b-popover>
      </b-form>
    </b-form-group>

    <hr class="my-4" />

    <NewQuotePreview
      date="This is a test"
      :to="masterData.company"
      :att="masterData.attention"
      :re="masterData.regarding"
      :desc="masterData.quoteDescForQuote"
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

      <b-button
        class="new-quote-button"
        @click="$bvModal.show('bv-modal-error')"
        variant="outline-secondary"
        >Test</b-button
      >
    </b-form-group>

    <b-modal id="bv-modal-dropbox" hide-footer>
      <template v-slot:modal-title>
        Uh oh!
      </template>
      <div class="d-block text-center">
        <p>
          Looks like this quote doesn't have a folder structure, would you like
          to make one?
        </p>
      </div>
      <b-button class="mt-3" block @click="$bvModal.hide('bv-modal-dropbox')"
        >Close</b-button
      >
    </b-modal>
    <b-modal id="bv-modal-error" hide-footer>
      <template v-slot:modal-title>
        Uh oh!
      </template>
      <div class="d-block text-left">
        <p>
          You have the following errors in your folder structure:
        </p>
        <div
          class="new-quote-modal-error-container"
          v-for="item in errors"
          v-bind:key="item.error"
        >
          <p class="new-quote-modal-error-item" style="color: red">
            Error
          </p>
          <p class="new-quote-modal-error-item" style="white-space: pre-line">
            {{ item.error }}
          </p>
          <br />
        </div>
      </div>
      <b-button class="mt-3" block @click="$bvModal.hide('bv-modal-error')"
        >Close</b-button
      >
    </b-modal>
  </div>
</template>

<script>
import NewQuotePreview from "./NewQuotePreview";
import Error from "./Error";
import { getParts } from "@/utils/pdf";
import { getMetaData } from "@/utils/quote";
import { writeXlsxFile } from "@/utils/xlsx";
import fs from "fs";
import axios from "axios";

export default {
  name: "NewQuote",

  components: {
    NewQuotePreview,
    Error
  },

  data() {
    return {
      initLoaded: false,
      file: null,
      errorInTotalLines: false,

      errors: null,

      modalMessage:
        "Too many hyphens. Only the following is allowed:\n\nCompany-State\nCompany-State-City\nCompany-Country\nCompany-Country-City",

      masterData: {
        attention: "",
        regarding: "",
        errorInPath: false,
        errorInParts: false,
        parts: null,
        company: "",
        quoteNumFromPath: "",
        quoteNumFromUser: "",
        quoteDescFromPath: "",
        quoteDescForQuote: "",
        serialNum: "",
        totalLines: 0,
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

  created() {},

  watch: {
    file() {
      this.handleInit();
    },

    serialNumComputed() {
      this.serialNumLogic();
    },

    quoteNumComputed() {
      this.regardingLogic();
    },

    extraLinesComputed() {
      this.extraLinesLogic();
    }
  },

  computed: {
    quoteNumValidation() {
      let match = this.masterData.quoteNumFromUser.match(
        /\d\dQ\d\d\dR\d{1,2}$/
      );
      if (match) {
        return true;
      }
      return false;
    },

    serialNumValidation() {
      return (
        (this.masterData.serialNum.length === 5 &&
          !isNaN(this.masterData.serialNum)) ||
        this.masterData.serialNum.length === 0
      );
    },

    generateButtonValidation() {
      if (
        (this.file &&
          this.quoteNumValidation &&
          this.serialNumValidation &&
          !this.errorInTotalLines) ||
        (this.masterData.errorInPath && !this.errorInTotalLines)
      ) {
        return false;
      }
      return true;
    },

    serialNumComputed() {
      return this.masterData.serialNum;
    },

    quoteNumComputed() {
      return this.masterData.quoteNumFromUser;
    },

    extraLinesComputed() {
      return this.selectOptions.selected;
    }
  },

  methods: {
    handleInit() {
      this.resetData();
      const dataStream = fs.readFileSync(this.file.path);
      this.masterData.filePath = this.file.path;
      getParts(dataStream, this.file.path).then(data => {
        this.initLoaded = true;

        this.masterData.errorInPath = data.errorInPath;
        this.masterData.errorInParts = data.errorInParts;

        this.masterData.parts = data.parts;
        this.masterData.totalLines = data.parts.length;

        this.masterData.company = data.company;

        this.masterData.quoteNumFromPath = data.quoteNumFromPath;
        if (!data.errorInPath) {
          this.masterData.quoteNumFromUser = data.quoteNumFromPath + "R";
        }

        this.masterData.quoteDescFromPath = data.quoteDescFromPath;
        this.masterData.quoteDescForQuote = data.quoteDescFromPath;

        if (data.errorInPath) {
          this.errors = data.errors;
          this.$bvModal.show("bv-modal-error");
        } else if (!data.isInDropbox) {
          this.$bvModal.show("bv-modal-dropbox");
        }
      });
    },

    handelGenerate() {
      axios({
        method: "post",
        url: "http://localhost:5000/writefile",
        headers: {
          data: JSON.stringify(this.masterData)
        }
      }).then(data => {
        console.log(data.data);
        this.$store.commit("addRecentQuote", data.data.recent_quote);
        this.makeToast(data.data);
      });

      // .catch(reason => {
      //   console.log(reason.data);
      //   this.makeToast(reason.data);
      // });
    },

    handleCancel() {
      this.$router.push("/");
    },

    serialNumLogic() {
      if (
        this.serialNumValidation &&
        this.masterData.serialNum.length > 0 &&
        this.initLoaded
      ) {
        this.masterData.quoteDescForQuote =
          this.masterData.quoteDescFromPath +
          " for pump " +
          this.masterData.serialNum;
      } else {
        this.masterData.quoteDescForQuote = this.masterData.quoteDescFromPath;
      }
    },

    regardingLogic() {
      if (this.initLoaded && !this.masterData.errorInPath) {
        this.masterData.regarding =
          "Witte quote " + this.masterData.quoteNumFromUser;
      }
    },

    extraLinesLogic() {
      if (this.masterData.totalLines + this.selectOptions.selected > 25) {
        this.errorInTotalLines = true;
      } else {
        this.errorInTotalLines = false;
      }
    },

    resetData() {
      this.initLoaded = false;
      let temp = {
        attention: "",
        regarding: "",
        errorInPath: false,
        errorInParts: false,
        parts: null,
        company: "",
        quoteNumFromPath: "",
        quoteNumFromUser: "",
        quoteDescFromPath: "",
        quoteDescForQuote: "",
        serialNum: "",
        totalLines: 0,
        filePath: ""
      };
      this.masterData = temp;
    },

    makeToast(data) {
      this.$bvToast.toast(data.message, {
        title: !data.exit_code ? "Success!" : "Uh oh!",
        variant: !data.exit_code ? "success" : "danger",
        solid: true,
        toaster: "b-toaster-bottom-full"
      });
    }
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

.bv-modal-error {
  text-align: right;
}

.new-quote-modal-error-item {
  margin-bottom: 0;
}

.new-quote-modal-error-container {
  overflow-x: hidden;
  overflow-y: scroll;
  white-space: nowrap;
}
</style>
