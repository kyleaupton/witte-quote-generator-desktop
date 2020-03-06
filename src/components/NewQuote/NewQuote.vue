<template>
  <div class="new-quote-main">
    <b-form-group>
      <b-form-text id="password-help-block">Start by selecting the quote from Germany.</b-form-text>
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
          {{ 25 - masterData.parts.length }} line(s) or less.
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
      >Generate</b-button>
      <b-button class="new-quote-button" @click="resetData" variant="outline-secondary">Reset</b-button>
      <b-button class="new-quote-button" @click="handleCancel" variant="outline-secondary">Back</b-button>
    </b-form-group>

    <!-- Modal to display errors in file path. Only displayed with file from dropbox. -->
    <b-modal id="bv-modal-error" hide-footer :hide-header-close="true" :no-close-on-backdrop="true">
      <template v-slot:modal-title>Uh oh!</template>
      <div class="d-block text-left">
        <p>You have the following error(s) in your folder structure:</p>
        <div class="new-quote-modal-error-container" v-for="item in errors" v-bind:key="item.error">
          <p class="new-quote-modal-error-item" style="color: red">Error</p>
          <p class="new-quote-modal-error-item" style="white-space: pre-line">- {{ item.error }}</p>
          <br />
        </div>
        <p>
          You can still create a quote, however you will be unable to save it to
          the improper directory. It is very important to either fix the errors,
          or create the file sturcture with the automated tool.
        </p>
      </div>
      <b-button
        class="mt-3"
        block
        @click="$bvModal.hide('bv-modal-error')"
        variant="outline-secondary"
      >Close</b-button>
    </b-modal>
    <b-modal
      id="bv-modal-make-folder-structure"
      hide-footer
      :hide-header-close="true"
      :no-close-on-backdrop="true"
    >
      <template v-slot:modal-title>Folder Structure:</template>
      <MakeFolderStructure @response="handleResponseFromMakeFileStructure" :file="file" />
    </b-modal>
  </div>
</template>

<script>
import NewQuotePreview from "./NewQuotePreview";
import MakeFolderStructure from "./MakeFolderStructure";
import { getParts } from "@/utils/pdf";
import { getMetaData } from "@/utils/quote";
import { writeXlsxFile } from "@/utils/xlsx";
import fs from "fs";
import axios from "axios";

export default {
  name: "NewQuote",

  components: {
    NewQuotePreview,
    MakeFolderStructure
  },

  data() {
    return {
      initLoaded: false,

      file: null,

      errorInTotalLines: false,

      errors: null,

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
      if (this.masterData.serialNum.match(/^\d{5}-\d{2,3}$/g)) {
        return true;
      } else if (this.masterData.serialNum.length === 0) {
        return true;
      }
      return false;
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
    },

    filePath() {
      if (this.fileFromChild) {
        return this.filePathFromChild;
      } else if (this.file) {
        return this.file.path;
      } else {
        return null;
      }
    }
  },

  methods: {
    handleInit() {
      // First check if file came from dropbox or from elsewhere.
      if (this.file.path.match(/Dropbox\/2 - Quotes/g)) {
        this.handleGetParts(this.file.path);
      } else {
        // Show modal to generate file struc
        this.$bvModal.show("bv-modal-make-folder-structure");
      }
    },

    handleGetParts(filePath) {
      this.resetData();
      const dataStream = fs.readFileSync(filePath);
      this.masterData.filePath = filePath;
      getParts(dataStream, filePath)
        .then(data => {
          this.initLoaded = true;

          this.masterData.errorInPath = data.errorInPath;
          this.masterData.errorInParts = data.errorInParts;

          this.masterData.parts = data.parts;
          this.masterData.totalLines = data.parts.length;

          this.masterData.company = data.company;

          this.masterData.quoteNumFromPath = data.quoteNumFromPath;
          if (!data.errorInPath && data.isInDropbox) {
            this.masterData.quoteNumFromUser = data.quoteNumFromPath + "R";
          }

          this.masterData.quoteDescFromPath = data.quoteDescFromPath;
          this.masterData.quoteDescForQuote = data.quoteDescFromPath;

          if (data.errorInPath) {
            console.log(data);
            this.errors = data.errors;
            this.$bvModal.show("bv-modal-error");
          }
        })
        .catch(error => {
          this.makeToast(
            "Uh oh",
            "It's possible that this quote is incompatible with this program. Please contact the developer if you have any questions.",
            "danger"
          );
        });
    },

    handelGenerate() {
      axios({
        method: "post",
        url: "http://localhost:1732/writefile",
        headers: {
          data: JSON.stringify(this.masterData)
        }
      }).then(data => {
        if (data.data.exit_code === 0) {
          this.$store.commit("addRecentQuote", data.data.recent_quote);
        }
        this.makeToastFromHTTPResponse(data.data);
      });
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
        this.masterData.totalLines =
          this.masterData.parts.length + this.selectOptions.selected;
        this.errorInTotalLines = false;
      }
    },

    resetData() {
      this.initLoaded = false;
      this.file = null;
      this.errorInTotalLines = false;
      this.errors = null;
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

    makeToastFromHTTPResponse(data) {
      this.$bvToast.toast(data.message, {
        title: !data.exit_code ? "Success!" : "Uh oh!",
        variant: !data.exit_code ? "success" : "danger",
        solid: true,
        toaster: "b-toaster-bottom-full"
      });
    },

    makeToast(title, message, variant) {
      this.$bvToast.toast(message, {
        title: title,
        variant: variant,
        solid: true,
        toaster: "b-toaster-bottom-full",
        autoHideDelay: 2000
      });
    },

    handleResponseFromMakeFileStructure(payload) {
      if (payload.error) {
        this.makeToast("Uh oh!", payload.message, "danger");
      } else if (payload.errorInPath) {
        this.masterData.errorInPath = true;
      } else {
        this.makeToast("Success", payload.message, "success");
        this.fileFromChild = true;
        this.handleGetParts(payload.newFilePath);
      }
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

.new-quote-modal-button {
  margin-right: 4px;
}
</style>
