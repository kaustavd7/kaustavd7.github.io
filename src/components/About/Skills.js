const SkillList = [
  "dance",
  "photography",
  "hopefully calisthenics and MMA",
];

const Skills = () => {
  return (
    <section className="w-full flex flex-col p-5 xs:p-10 sm:p-12 md:p-16 lg:p-20 border-b-2 border-solid border-dark dark:border-light
     text-dark dark:text-light">
      <span className="font-semibold text-lg sm:text-3xl md:text-4xl text-accent dark:text-accentDark">
        I'm a 21 year old guy, archiving the words coz may be datacenters will be the only thing left in the future.
      </span>

    
      {/* Normal text paragraphs after bio */}
      <div className="mt-8 space-y-4">
        <p className="text-base sm:text-lg leading-relaxed">
         I started writting about random stuff post summer-twenty twenty four to improve my articulations, under the umbrella of 'the placement prep'. I have penned down (not literally, i write in .doc) exactly 54 times, totalling word count of 24613 as of twenty-first August, 2025. Quite a few times i have resolved to write daily, clearly i have failed. Tho much of content can't be shared in open internet, but some of it can. So, after college ended, with ample amount of FREE time. I decided to create this website, but each time i tried, the code failed at the same spot. <br /> My mechanical degree and chatgpt gave up. 
        <br /> Halfway through august, with few days in hand before i leave home on train to Hazrat Nizamuddin Station for my job, my brain had me telling this simple task had to be completed. So, this time taking the simpler path, i got the website up and running in few days with git-repos, chat-gpt and vercel. 
        </p>
        <p className="text-base sm:text-lg leading-relaxed">
          Now, the website the like a new toy for seven year old, to play with. You may find random component(not needed to the website), quotes, photos, with no correlation or pattern what-so-ever. I intend to keep it as my source of timepass and hence no advertisement as of yet.
        </p>
        <p className="text-base sm:text-lg leading-relaxed">
          The name <i>kaayam</i>(qaayam) means ठहरना, ठहराव। arabic/persian word. <br /> I found the word when once i texted my friend "dunia kaayam h ishq ke wajah se, kuch toh sachai hogi isme". My curious mind wanted to know the literal meaning of the word - my heart loved the meaning, then with extension the word.
        </p>
        <p className="text-base sm:text-lg leading-relaxed">
          The icon is collage of three frames from a fairly popular and good movie <i>la la land</i>. Liking a rom-com is actually extremely subjective. When you watch a WW2 film, everyone is fairly at same level, because the majority has never actually seen war. But rom-com - well, people have lived that stuff, so one is at the same level. Hence, a simple sweet rom-com is usually hit, as it resonates with masses. A complicated one, doesn't. la la land along with other elements had realistic ending, again resonating with mass. I like <i>materialist</i> for a very particular response in one of the dialougues.
          <br /> I personally don't like rom-com, full of cliche, predictable, normie stuff. But i like these two films. <br /> so yes romcom - subjective
        </p>
      </div>
    
      <ul className="flex flex-wrap mt-8 justify-center  xs:justify-start">
        {SkillList.map((item, index) => {
          return (
            <li
              key={index}
              className="font-semibold inline-block capitalize text-base xs:text-lg sm:text-xl  md:text-2xl py-2 xs:py-3 sm:py-4 lg:py-5 px-4 xs:px-6 sm:px-8 lg:px-12 border-2 border-solid border-dark dark:border-light rounded mr-3 mb-3 xs:mr-4 xs:mb-4  md:mr-6 md:mb-6 hover:scale-105 transition-all ease duration-200 cursor-pointer dark:font-normal" 
            >
              {item}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default Skills;
