export default function EmailConfirmation() {
  return (
    <div
      className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span className="block sm:inline">
        A confirmation email has been sent to the email associated with your
        GitHub account.
      </span>
    </div>
  );
}
