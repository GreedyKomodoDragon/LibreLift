import { BoxRow } from "@/components/boxRow";
import { NewsLetterSignUp } from "@/components/landing/newsletter";
import Searchbar from "@/components/searchbar";

export default function Home() {
  return (
    <>
      <section className="w-full">
        <div className="container px-4 md:px-6">
          <main className="flex-1">
            <section className="w-full py-12 md:py-24 lg:py-32">
              <div className="container px-4 md:px-6 grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                    Empower Open Source Developers
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 max-w-[600px] text-xl">
                    Our donation platform makes it easy for users to support
                    their favorite open source projects with one-time or
                    recurring donations.
                  </p>
                  <div className="flex gap-4">
                    <Searchbar />
                  </div>
                </div>
                <div>
                  <img
                    src="https://placehold.co/600x400/purple/white"
                    alt="About Us"
                    className="rounded-xl"
                    style={{ aspectRatio: 600 / 400, objectFit: "cover" }}
                    width="600"
                    height="400"
                  />
                </div>
              </div>
            </section>
            <section id="features" className="w-full py-12 md:py-24 lg:py-32">
              <div className="container px-4 md:px-6 grid gap-12">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-bold tracking-tighter">
                    Features
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 max-w-[700px] mx-auto text-xl">
                    Our donation platform offers a range of features to make it
                    easy for users to support their favorite open source
                    projects.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-10 w-10 text-gray-900 dark:text-gray-50"
                    >
                      <polyline points="20 12 20 22 4 22 4 12"></polyline>
                      <rect width="20" height="5" x="2" y="7"></rect>
                      <line x1="12" x2="12" y1="22" y2="7"></line>
                      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                    </svg>
                    <h3 className="text-2xl font-semibold">
                      One-Time Donations
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Allow users to make one-time donations to support their
                      favorite open source projects.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-10 w-10 text-gray-900 dark:text-gray-50"
                    >
                      <path d="m4 5 8 8"></path>
                      <path d="m12 5-8 8"></path>
                      <path d="M20 19h-4c0-1.5.44-2 1.5-2.5S20 15.33 20 14c0-.47-.17-.93-.48-1.29a2.11 2.11 0 0 0-2.62-.44c-.42.24-.74.62-.9 1.07"></path>
                    </svg>
                    <h3 className="text-2xl font-semibold">Subscriptions</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Enable users to set up recurring donations to support
                      their favorite open source projects.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-10 w-10 text-gray-900 dark:text-gray-50"
                    >
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                      <line x1="4" x2="4" y1="22" y2="15"></line>
                    </svg>
                    <h3 className="text-2xl font-semibold">Flat Fee</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      We charge a flat fee on all donations to cover our
                      operating costs and ensure the platform remains
                      sustainable.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-10 w-10 text-gray-900 dark:text-gray-50"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9 9.35a4 4 0 1 1 0 5.3"></path>
                    </svg>
                    <h3 className="text-2xl font-semibold">Open Source</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      We believe in the power of open source, so we&apos;ve open
                      sourced parts of our platform to give back to the
                      community.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-10 w-10 text-gray-900 dark:text-gray-50"
                    >
                      <path d="M5 12s2.545-5 7-5c4.454 0 7 5 7 5s-2.546 5-7 5c-4.455 0-7-5-7-5z"></path>
                      <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path>
                      <path d="M21 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2"></path>
                      <path d="M21 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"></path>
                    </svg>
                    <h3 className="text-2xl font-semibold">Secure Payments</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      We use Stripe to manage payments, we leave the finances to
                      the experts! If you do not have a stripe business account
                      you will need to sign up to one before you can accept
                      payments
                    </p>
                  </div>
                  <div className="space-y-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-10 w-10 text-gray-900 dark:text-gray-50"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <path d="M12 17h.01"></path>
                    </svg>
                    <h3 className="text-2xl font-semibold">Community</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      As part of Librelift we are aiming to build a community to
                      help guide the direction of Librelift
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
              <div className="container px-4 md:px-6 grid gap-12">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-bold tracking-tighter">
                    Pricing
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 max-w-[700px] mx-auto text-xl">
                    Our pricing is designed to be simple and transparent, with a
                    flat fee on all donations to ensure the platform remains
                    sustainable.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div
                    className="rounded-lg border bg-card text-card-foreground shadow-sm"
                    data-v0-t="card"
                  >
                    <div className="flex flex-col space-y-1.5 p-6">
                      <h3 className="whitespace-nowrap text-2xl font-semibold leading-none tracking-tight">
                        One-Time Donations
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Support your favorite open source projects with a
                        one-time donation.
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="space-y-2">
                        <p className="text-4xl font-bold">10%</p>
                        <p className="text-gray-500 dark:text-gray-400">
                          Flat fee on all one-time donations
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className="rounded-lg border bg-card text-card-foreground shadow-sm"
                    data-v0-t="card"
                  >
                    <div className="flex flex-col space-y-1.5 p-6">
                      <h3 className="whitespace-nowrap text-2xl font-semibold leading-none tracking-tight">
                        Subscriptions
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Set up recurring donations to support your favorite open
                        source projects.
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="space-y-2">
                        <p className="text-4xl font-bold">10%</p>
                        <p className="text-gray-500 dark:text-gray-400">
                          Flat fee on all subscription donations
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className="rounded-lg border bg-card text-card-foreground shadow-sm"
                    data-v0-t="card"
                  >
                    <div className="flex flex-col space-y-1.5 p-6">
                      <h3 className="whitespace-nowrap text-2xl font-semibold leading-none tracking-tight">
                        Enterprise (Coming Soon!)
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Custom pricing for large organizations and enterprises.
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="space-y-2">
                        <p className="text-2xl font-bold">Contact Us</p>
                        <p className="text-gray-500 dark:text-gray-400">
                          Get a custom quote for your organization
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section id="about" className="w-full py-12 md:py-24 lg:py-32">
              <div className="container px-4 md:px-6 grid gap-12">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-bold tracking-tighter">
                    About Us
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 max-w-[700px] mx-auto text-xl">
                    We are a team of passionate developers who believe in the
                    power of open source. Our mission is to help open source
                    projects thrive by making it easy for users to support them.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <img
                      src="https://placehold.co/600x400/purple/white"
                      alt="About Us"
                      className="rounded-xl"
                      style={{ aspectRatio: 600 / 400, objectFit: "cover" }}
                      width="600"
                      height="400"
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold">Our Mission</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      We are passionate about open source software, it is the
                      backbone of today&apos;s digital world. Our mission is simple:
                      support the amazing developers who make it all happen.
                      We&apos;re dedicated to making it effortless for users to back
                      their favorite open source projects, ensuring they can
                      continue to flourish and expand.
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      e believe that by empowering developers and users alike,
                      we can cultivate a collaborative community where
                      creativity knows no bounds and the potential of open
                      source software is fully unleashed. Together, let&apos;s keep
                      the open source spirit strong!
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </main>
          <div className="mb-40">
            <NewsLetterSignUp />
          </div>
        </div>
      </section>
      <footer className="w-full bg-violet-950 text-gray-50 py-4">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <nav className="flex gap-4 sm:gap-6">
            <a className="text-sm hover:underline" href="/term-of-service">
              Terms of Service
            </a>
            <a className="text-sm hover:underline" href="/privacy-policy">
              Privacy Policy
            </a>
            <a className="text-sm hover:underline" href="https://github.com/GreedyKomodoDragon/LibreLift">
              Open Source
            </a>
          </nav>
          <p className="text-sm">© 2024 LibreLift. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
