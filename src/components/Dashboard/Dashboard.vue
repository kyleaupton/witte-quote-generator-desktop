<template>
  <div class="dashboard-main">
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
    <b-button
      class="dashboard-button"
      variant="outline-success"
      @click="handleNewQuote"
    >
      New Quote
    </b-button>
    <b-button class="dashboard-button" variant="outline-success" @click="test">
      test
    </b-button>
  </div>
</template>

<script>
import Header from "./Header";
import RecentQuote from "./RecentQuote";

export default {
  name: "Dashboard",

  components: {
    Header,
    RecentQuote
  },

  data() {
    return {
      recents: null
    };
  },

  created() {
    this.getRecents();
  },

  methods: {
    getRecents() {
      this.recents = JSON.parse(this.$store.getters.recentQuotes);
      console.log(this.recents);
    },

    handleNewQuote() {
      this.$router.push("/newquote");
    },

    test() {
      this.$store.commit("clearRecentQuotes");
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
