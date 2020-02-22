<template>
  <div class="new-quote-preview-main">
    <div class="new-quote-preview-container">
      <img
        class="new-quote-preview-pic"
        src="@/assets/preview.png"
        height="175"
      />
      <div class="new-quote-preview-date">test</div>
      <div class="new-quote-preview-to">{{ to }}</div>
      <div class="new-quote-preview-att">{{ att }}</div>
      <div class="new-quote-preview-re">{{ re }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NewQuotePreview",
  props: ["to", "att", "re"]
};
</script>

<style>
.new-quote-preview-main {
  width: 100%;
  display: flex;
  justify-content: center;
  font-size: 14px;
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
  top: 22px;
  left: 105px;
}

.new-quote-preview-att {
  display: inline-block;
  position: absolute;
  top: 38.5px;
  left: 105px;
}

.new-quote-preview-re {
  display: inline-block;
  position: absolute;
  top: 55px;
  left: 105px;
}
</style>
