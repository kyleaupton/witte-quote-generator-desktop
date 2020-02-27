import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

/*
      Sample data to be kept in recentQuotes:

      quoteNumber: '',
      company: '',
      pathToQuote: '',
      pathToWorkingDirectory: '',
      timeCreated: '', // Epoch time

    */

const getDefaultState = () => {
  let recentQuotes = null;

  if (!localStorage.getItem("recentQuotes")) {
    localStorage.setItem("recentQuotes", JSON.stringify([]));
    recentQuotes = localStorage.getItem("recentQuotes");
    console.log("Made new recent quotes array in local storage");
  } else {
    recentQuotes = localStorage.getItem("recentQuotes");
  }

  return {
    recentQuotes: recentQuotes
  };
};

export default new Vuex.Store({
  state: getDefaultState(),
  mutations: {
    clearRecentQuotes(state) {
      localStorage.setItem("recentQuotes", JSON.stringify([]));
      state.recentQuotes = localStorage.getItem("recentQuotes");
    },

    addRecentQuote(state, quote) {
      let recentQuotes = JSON.parse(localStorage.getItem("recentQuotes"));

      // Check to make sure we're not adding the same quote twice. Unique key is quote num with revision.
      for (let i = 0; i < recentQuotes.length; i++) {
        if (recentQuotes[i].quoteNumber === quote.quoteNumber) {
          console.log("Quote already in recents, omitting.");
          return;
        }
      }

      if (recentQuotes.length === 20) {
        recentQuotes.unshift(quote);
        recentQuotes.pop();
      } else {
        recentQuotes.unshift(quote);
      }
      state.recentQuotes = recentQuotes;
      localStorage.setItem("recentQuotes", JSON.stringify(recentQuotes));
    }
  },
  actions: {},
  modules: {},
  getters: {
    recentQuotes: state => {
      return state.recentQuotes;
    }
  }
});
