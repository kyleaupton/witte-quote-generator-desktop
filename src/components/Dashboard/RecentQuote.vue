<template>
  <div clas="recent-quote-main">
    <b-card :title="data.company">
      <p>{{ data.quoteNumber }}</p>
    </b-card>
  </div>
</template>

<script>
export default {
  name: "RecentQuote",

  props: ["data"]
};
</script>

<style>
.recent-quote-main {
  display: inline-block;
}
</style>
