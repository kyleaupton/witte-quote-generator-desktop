<template>
  <div>
    <div>
      <b-form-group inline class="new-quote-input-group">
        <b-form class="make-foler-scruc-input-group-form" inline>
          <b-form-input
            class="make-foler-scruc-input-item"
            v-model="company"
            placeholder="Company"
            :state="companyValidation"
          />
          <b-form-input
            class="make-foler-scruc-input-item"
            v-model="meta"
            placeholder="Quote Num and Description"
            :state="metaValidation"
          />
        </b-form>
      </b-form-group>
    </div>
    <b-button
      class="make-folder-struc-button"
      @click="$bvModal.hide('bv-modal-make-folder-structure')"
      variant="outline-secondary"
      >Cancel</b-button
    >
    <b-button
      class="make-folder-struc-button"
      @click="makeStructure"
      variant="outline-primary"
      >Make Structure</b-button
    >
  </div>
</template>

<script>
import { checkCompany } from "../../utils/pathValidator";
import { checkMeta } from "../../utils/pathValidator";
import fs from "fs";
import path from "path";
import os from "os";

export default {
  name: "MakeFolderStructure",

  data() {
    return {
      company: "",
      meta: ""
    };
  },

  created() {
    console.log(this.file);
  },

  computed: {
    companyValidation() {
      let validation = checkCompany(this.company);
      return !validation.errorInCompany;
    },

    metaValidation() {
      let validation = checkMeta(this.meta);
      return !validation.errorInMeta;
    }
  },

  methods: {
    makeStructure() {
      let workindDir = path.join(
        os.homedir(),
        "Dropbox",
        "2 - Quotes",
        this.company,
        this.meta
      );
      let payload = {
        error: false,
        message: "",
        newFile: null
      };
      if (!fs.existsSync(workindDir)) {
        let newFilePath = path.join(workindDir, this.file.name);
        fs.mkdirSync(workindDir, { recursive: true });
        fs.copyFileSync(this.file.path, newFilePath);
        this.file.path = newFilePath;
        payload.newFile = this.file;
        payload.message = "Successfully created file structure.";
        this.$emit("response", payload);
      } else {
        payload.error = true;
        payload.message = "File structure already exists!";
        this.$emit("response", payload);
      }
    }
  },

  props: ["file"]
};
</script>

<style>
.make-foler-scruc-input-item {
  width: 100% !important;
  margin-bottom: 4px;
}

.make-folder-struc-button {
  margin-right: 4px;
}
</style>
