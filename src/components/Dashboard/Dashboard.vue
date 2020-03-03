<template>
  <div class="dashboard-main">
    <b-card class="dashboard-recents-card" header="Recents">
      <div class="dashboard-recents-container">
        <div v-if="recents.length > 0">
          <RecentQuote
            class="dashboard-recent-element"
            v-for="item in recents"
            v-bind:key="item.quoteNumber"
            :data="item"
          />
          <p @click="clearRecents" class="dashboard-recent-clear">
            Clear recents
          </p>
        </div>
        <div
          class="dashboard-recents-text-container"
          v-if="recents.length === 0"
        >
          <p>No recents</p>
        </div>
      </div>
    </b-card>
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

export default {
  name: "Dashboard",

  components: {
    Header,
    RecentQuote
  },

  created() {},

  computed: {
    recents() {
      return JSON.parse(this.$store.getters.recentQuotes);
    }
  },

  methods: {
    handleNewQuote() {
      this.$router.push("/newquote");
    },

    clearRecents() {
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
  width: 810px;
  height: 153px;
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

.dashboard-recents-text-container {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  color: #6c757d;
}

.dashboard-recent-clear {
  position: absolute;
  top: 52px;
  right: 4px;
  font-size: 10px;
  text-decoration: underline;
  cursor: pointer;
}
</style>
