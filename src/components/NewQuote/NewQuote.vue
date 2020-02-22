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
          v-model="data.quoteNum"
          placeholder="Quote Number"
          :state="quoteNumValidation"
        />
        <b-form-input v-model="data.attention" placeholder="Attention" />
        <b-form-input v-model="data.serialNum" placeholder="Serial Number" />
        <b-form-select
          v-model="selectOptions.selected"
          :options="selectOptions.options"
        />
      </b-form>
    </b-form-group>

    <hr class="my-4" />

    <NewQuotePreview />

    <hr class="my-4" />

    <b-form-group>
      <b-button
        @click="handelGenerate"
        variant="outline-success"
        :disabled="generateButtonValidation"
        >Generate</b-button
      >
      <b-button @click="handleCancel" variant="outline-secondary"
        >Cancel</b-button
      >
    </b-form-group>
  </div>
</template>

<script>
import NewQuotePreview from "./NewQuotePreview";
import { getParts } from "@/utils/pdf";
import fs from "fs";

export default {
  name: "NewQuote",

  components: {
    NewQuotePreview
  },

  data() {
    return {
      file: null,
      data: {
        company: "",
        state: "",
        attention: "",
        regarding: "",
        quoteNum: "",
        serialNum: ""
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

  computed: {
    quoteNumValidation() {
      let match = this.data.quoteNum.match(/\d\dQ\d\d\dR\d{1,2}$/);
      if (match) {
        return true;
      }
      return false;
    },

    serialNumValidation() {
      return this.data.quoteNum.length === 5 && !isNaN(this.data.quoteNum);
    },

    generateButtonValidation() {
      if (this.file) {
        return false;
      }
      return true;
    }
  },

  created() {
    // const dataBuffer = fs.readFileSync(this.file.path);
    // getPdfText(dataBuffer).then(data => {
    //   console.log(data);
    // });
  },

  methods: {
    handleCancel() {
      this.$router.push("/");
    },

    handelGenerate() {
      const dataStream = fs.readFileSync(this.file.path);
      getParts(dataStream).then(data => {
        console.log(data);
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
</style>
