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
         I started writting about random stuff post summer-2024 to improve my articulations, under the umbrella of 'the placement prep'. I have penned down (not literally, i write in .doc) exactly 54 times, totalling word count o24613 as of 21st August, 2025. Quite a few times i have resolved to write daily, clearly i have failed. Tho much of content can't be shared in open internet, but some of it can. So, after college ended, with ample amount of FREE time. I decided to create this website, but each time i tried, the code failed at the same spot, my mechanical degree and chatgpt gave up. 
         Halfway through august, with few days in hand before i leave home on train to Hazrat Nizamuddin Station for my job, this simple task had to be completed. "If not now, then forget it". So, this time taking the simpler path, i got the website up and running in few days with git-repos, chat-gpt and vercel. 
        </p>
        <p className="text-base sm:text-lg leading-relaxed">
          Now, the website the like a new toy to play with, for seven year old. You may find random component(not needed to the website), quotes, photos, with no correlations what-so-ever. I intend to keep it as my source of timepass and hence no advertisement as of yet.
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
