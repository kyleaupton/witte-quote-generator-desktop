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
            list="company-datalist"
          />
          <b-form-datalist
            class="make-folder-struc-datalist"
            id="company-datalist"
            :options="companyList"
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
      @click="handleCancel"
      variant="outline-secondary"
    >No, thanks.</b-button>
    <b-button
      class="make-folder-struc-button"
      @click="handleMakeStructure"
      variant="outline-primary"
      :disabled="!generateValidation"
    >Make Structure</b-button>
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
      meta: "",
      companyList: []
    };
  },

  mounted() {
    this.getCompanyList();
  },

  computed: {
    companyValidation() {
      let validation = checkCompany(this.company);
      return !validation.errorInCompany;
    },

    metaValidation() {
      let validation = checkMeta(this.meta);
      return !validation.errorInMeta;
    },

    generateValidation() {
      return this.companyValidation && this.metaValidation;
    }
  },

  methods: {
    handleMakeStructure() {
      let workindDir = path.join(
        os.homedir(),
        "Dropbox",
        "2 - Quotes",
        this.company,
        this.meta
      );
      let payload = {
        error: false,
        errorInPath: false,
        message: "",
        newFilePath: ""
      };
      if (!fs.existsSync(workindDir)) {
        let newFilePath = path.join(workindDir, this.file.name);
        fs.mkdirSync(workindDir, { recursive: true });
        fs.copyFileSync(this.file.path, newFilePath);
        payload.newFilePath = newFilePath;
        payload.message = "Successfully created file structure.";
        this.$emit("response", payload);
        this.$bvModal.hide("bv-modal-make-folder-structure");
      } else {
        payload.error = true;
        payload.message = "File structure already exists!";
        this.$emit("response", payload);
        this.$bvModal.hide("bv-modal-make-folder-structure");
      }
    },

    handleCancel() {
      let payload = {
        error: false,
        errorInPath: true,
        message: "",
        newFilePath: ""
      };
      this.$emit("response", payload);
      this.$bvModal.hide("bv-modal-make-folder-structure");
    },

    getCompanyList() {
      let workingDir = path.join(os.homedir(), "Dropbox", "2 - Quotes");
      let temp = fs.readdirSync(workingDir);

      let dirsToRemove = [
        ".DS_Store",
        "1 - Archives 2018-2005",
        "1 - India",
        "1 - Templates"
      ];

      for (let i = 0; i < dirsToRemove.length; i++) {
        let indexToRemove = temp.indexOf(dirsToRemove[i]);
        if (indexToRemove > -1) {
          temp.splice(indexToRemove, 1);
        }
      }
      this.companyList = temp;
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
