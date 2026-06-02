import { supabase } from './supabase';
import { RESERVED_USERNAMES } from './constants';

const ADJS = ["rusty","greasy","turbo","speedy","chunky","mighty","brave","sneaky","cheeky","grumpy","fuzzy","zippy","nimble","cranky","dusty","peppy","feisty","gnarly","plucky","dinky","nifty","quirky","spunky","wiry","bolty","grimy","oily","ratty","scruffy","grubby"];
const ANIMALS = ["rat","mouse","vole","shrew","ferret","weasel","stoat","beaver","marmot","squirrel","rabbit","hare","mole","badger","raccoon","possum","skunk","lemur","degu","pika","jerboa","otter","quokka","numbat","bilby","wombat","gerbil","hamster","meerkat"];

export const makeUsername = () => {
  const a = ADJS[Math.floor(Math.random()*ADJS.length)];
  const b = ANIMALS[Math.floor(Math.random()*ANIMALS.length)];
  return `${a}_${b}_${Math.floor(Math.random()*900)+100}`;
};

export const checkUsernameAvailable = async (name) => {
  if (RESERVED_USERNAMES.has(name.toLowerCase())) return false;
  const { data } = await supabase.from("profiles").select("id").eq("username", name.toLowerCase()).maybeSingle();
  return !data;
};

export const generateAvailableUsername = async () => {
  for (let i = 0; i < 10; i++) {
    const name = makeUsername();
    if (await checkUsernameAvailable(name)) return name;
  }
  return makeUsername();
};
