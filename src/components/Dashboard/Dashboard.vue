<template>
  <div class="dashboard-main">
    <div>Updater Test 2</div>
    <b-card class="dashboard-recents-card" header="Recents">
      <div class="dashboard-recents-container">
        <RecentQuote
          class="dashboard-recent-element"
          v-for="item in recents"
          v-bind:key="item.quoteNumber"
          :data="item"
        />
      </div>
    </b-card>
    <!-- <hr class="my-4 dashboard-divider" /> -->
    <b-button
      class="dashboard-button"
      variant="outline-success"
      @click="handleNewQuote"
    >
      New Quote
    </b-button>
  </div>
</template>

<script>
import Header from "./Header";
import RecentQuote from "./RecentQuote";
// const dbrecents = require("../../../db/dbrecents");

export default {
  name: "Dashboard",

  components: {
    Header,
    RecentQuote
  },

  data() {
    return {
      recents: []
    };
  },

  created() {
    // this.getRecents();
  },

  methods: {
    getRecents() {
      dbrecents.getAll(callback => {
        this.recents = callback;
      });
    },

    handleNewQuote() {
      this.$router.push("/newquote");
    }
  }
};
</script>

<style sass.vue>
.dashboard-main {
  margin: 24px;
}

.dashboard-recents-card {
  width: 100%;
  display: inline-block;
}

.dashboard-recents-container {
  overflow-x: scroll;
  overflow-y: hidden;
  white-space: nowrap;
}

.dashboard-recent-element {
  display: inline-block;
  margin: 6px;
}

.dashboard-divider {
  margin-left: 12px;
  margin-right: 12px;
}

.dashboard-button {
  margin-top: 24px;
}
</style>
