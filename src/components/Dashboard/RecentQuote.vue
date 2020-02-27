<template>
  <div clas="recent-quote-main">
    <b-card class="recent-quote-card" :title="data.company">
      <p class="recent-quote-item">{{ data.quoteNumber }}</p>
      <b-button variant="outline-primary" size="sm">
        Open
      </b-button>
      <p id="recent-quote-created" class="recent-quote-created">
        {{ createdText }}
      </p>
    </b-card>
  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "RecentQuote",

  data() {
    return {
      createdText: "Created " + moment.unix(this.data.timeCreated).fromNow()
    };
  },

  mounted() {
    setInterval(() => {
      this.createdText =
        "Created " + moment.unix(this.data.timeCreated).fromNow();
    }, 1000);
  },

  props: ["data"]
};
</script>

<style>
.recent-quote-main {
  display: inline-block;
}

.recent-quote-card {
  position: relative;
  display: flex;
  justify-content: center;
}

.recent-quote-created {
  position: absolute;
  font-size: 10px;
  top: 90%;
  left: 4px;
}

.recent-quote-item {
  margin-bottom: 4px;
}
</style>
