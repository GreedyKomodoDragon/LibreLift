export function NewsLetterSignUp() {
  return (
    <section className="w-full">
      <div className="container px-4 flex flex-col gap-4 items-center text-center">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-5xl font-extrabold">
            Join our Mailing List
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Join our community to help fund open source projects and receive
            updates on their progress.
          </p>
        </div>
        <div className="w-full max-w-[400px] space-y-4">
          <div className="flex flex-col">
            <label className="sr-only" htmlFor="email">
              Email
            </label>
            <input
              className="w-full border-black border-2 p-2 rounded-md"
              id="email"
              placeholder="Enter your email"
              type="email"
            />
          </div>
          <button className="w-full bg-black rounded-md text-white py-3" type="submit">
            Join Now
          </button>
        </div>
      </div>
    </section>
  );
}
