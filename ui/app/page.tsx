import { BoxRow } from "@/components/boxRow";
import { NewsLetterSignUp } from "@/components/newsletter";
import Searchbar from "@/components/searchbar";

export default function Home() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 items-center">
          <div className="flex flex-col justify-center space-y-8 text-center">
            <div className="space-y-2">
              <h1 className="pb-4 text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Help Fund Open Source Projects
              </h1>
              <p className="max-w-[600px] text-black md:text-xl dark:text-white mx-auto">
                Join the Movement to Support Open Source Projects, search for your next project to lift up!
              </p>
            </div>
            <Searchbar />
          </div>
        </div>
        <div className="my-36">
          <BoxRow />
        </div>
        <div className="my-36">
          <BoxRow />
        </div>
        <NewsLetterSignUp />
      </div>
    </section>
  );
}
