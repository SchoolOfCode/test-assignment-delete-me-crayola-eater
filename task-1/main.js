const celebs = [
  "David Beckham",
  "Cher",
  "Madonna",
  "Tom Petty",
  "Cristiano Ronaldo",
  "Whoopi Goldberg",
  "Samuel L Jackson",
  "Angelina Jolie",
  "Richard Osman",
  "Emma Thompson",
];

function makeLegend(name) {
  return `${name} is now a legend.`;
}

const legendaryCelebs = celebs.map(makeLegend);

const vowelCelebs = celebs.filter((name) => /^[aeiou]/i.test(name));
