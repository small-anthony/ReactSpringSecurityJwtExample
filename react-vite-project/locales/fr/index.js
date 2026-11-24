import part0 from "./common.json";
import part1 from "./inscription.json";
import part2 from "./offres.json";
import part3 from "./etudiant.json";
import part4 from "./contrats.json";
import part5 from "./evaluations.json";
import part6 from "./gestionnaire.json";
import part7 from "./professeur.json";
import auth from "./auth.json";
import notification from "./notification.json";

const main = {
  ...part0,
  ...part1,
  ...part2,
  ...part3,
  ...part4,
  ...part5,
  ...part6,
  ...part7,
};

export default {
  main,
  auth,
  notification,
};
