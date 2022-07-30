const fs = require("fs");

 const checkEnsNameAvailability = async () => {  

  // get the data from the file with just words starting from the new line (.csv like)
  const data = fs.readFileSync("./itemsToCheck.txt", "UTF-8");
  
  // split the contents by new line
  const words = data.split(/\r?\n/);
  
  //remove capital letters
  const lowerCaseWords = words.map((word) => word.toLowerCase());
  
  //remove duplicates
  const uniqueWords = [...new Set(lowerCaseWords)];
  
  //remove strings which are shorter then 5 characters
  const wordsWith5Characters = uniqueWords.filter((word) => word.length > 4);

  //add .eth to the end of each string
  const wordsWithEth = wordsWith5Characters.map((word) => word + ".eth");


  //split data in chunks of 100
  const chunkSize = 100;
  const chunks = [];
  for (let i = 0; i < wordsWithEth.length; i += chunkSize) {
    chunks.push(wordsWithEth.slice(i, i + chunkSize));
  }

  let availableNames = [];
  let counter = 0;

  console.log(`Total words loaded: ${data.length}, total to process: ${wordsWithEth.length}, total chunks: ${chunks.length}, `)
  //iterate over chunks
  for (const chunk of chunks) {
    const availability = await checkOwner(chunk);
    const notAvailable = availability.data.domains.map((d) => d.name);
    const available = chunk.filter(
    (name) => !notAvailable.includes(name)
  );
        
    // Slow down to public API not to kick us
    await new Promise((resolve) => setTimeout(resolve, 1000));
    available.push("");

    //write avaliable names to file
    fs.appendFileSync("./itemsChecked.txt", available.join("\n"));
    availableNames.push(...available);
    console.log(`Processed chunk ${counter}. Avaliable: ${avaliable}`);
    counter++;
  }
};

//creates graphql request to public ens graphql api
const checkOwner = async (data: string[]) => {
  const postRequestUrl =
    "https://api.thegraph.com/subgraphs/name/ensdomains/ens";
  const response = await fetch(postRequestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `{
          domains(where:{name_in:[${data.map((d) => `"${d}"`)}]}) {
            id
                name
            owner {
              id
            }
          }
        }`,
    }),
  });
  const json = await response.json();
  return json;
};

