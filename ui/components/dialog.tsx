type AddRepoDialogProps = {
  isOpen: boolean;
  onClose: Function;
  repo: string;
  onAdd: Function;
};

export const AddRepoDialog = (props: AddRepoDialogProps) => {
  const { isOpen, onClose, repo, onAdd } = props;

  const handleAddClick = () => {
    onAdd();
    onClose();
  };

  return (
    <div
      className={`fixed z-10 inset-0 overflow-y-auto ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div className="bg-white rounded-lg p-8 max-w-xl w-full z-50 overflow-hidden transform transition-all">
          <h2 className="text-xl font-semibold mb-4">
            Add the Repository: {repo}
          </h2>
          <p className="mb-4">
            Adding {repo} to your Librelift profiles will allow for it to be
            selected for funding!
          </p>
          <div className="flex justify-end">
            <button
              onClick={handleAddClick}
              className="bg-blue-500 text-white py-2 px-4 rounded mr-2"
            >
              Add
            </button>
            <button
              onClick={() => onClose()}
              className="bg-gray-300 text-gray-800 py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
