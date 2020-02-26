<template>
  <div class="new-quote-preview-main">
    <div class="new-quote-preview-container">
      <img
        class="new-quote-preview-pic"
        src="@/assets/preview.png"
        height="175"
      />
      <!-- <div class="new-quote-preview-date">{{ date }}</div> -->
      <div class="new-quote-preview-to">{{ to }}</div>
      <div class="new-quote-preview-att">{{ att }}</div>
      <div class="new-quote-preview-re">{{ re }}</div>
      <div class="new-quote-preview-desc">
        <div class="test-test">{{ desc }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NewQuotePreview",

  created() {},

  props: ["date", "to", "att", "re", "desc"]
};
</script>

<style>
.new-quote-preview-main {
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
  width: 100%;
  display: flex;
  justify-content: center;
  font-size: 12px;
}

.new-quote-preview-container {
  position: relative;
}

.new-quote-preview-pic {
  border: 1px solid;
  border-radius: 0.25rem;
}

.new-quote-preview-date {
  display: inline-block;
  position: absolute;
  top: 5px;
  left: 105px;
}

.new-quote-preview-to {
  display: inline-block;
  position: absolute;
  top: 23px;
  left: 105px;
}

.new-quote-preview-att {
  display: inline-block;
  position: absolute;
  top: 39px;
  left: 105px;
}

.new-quote-preview-re {
  display: inline-block;
  position: absolute;
  top: 56px;
  left: 105px;
}

.new-quote-preview-desc {
  /* background-color: aquamarine; */
  text-align: center;
  position: absolute;
  top: 97px;
  left: 100px;
  width: 232px;
  /* border-style: solid;
  border-width: 1px;
  border-color: black; */
}

.test-test {
  display: inline-block;
  /* background-color: aqua; */
}
</style>
