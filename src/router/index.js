import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: require("@/components/Dashboard/Dashboard").default
    },
    {
      path: "/newquote",
      name: "newquote",
      component: require("@/components/NewQuote/NewQuote").default
    },
    {
      path: "*",
      redirect: "/"
    }
  ]
});
