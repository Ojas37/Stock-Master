export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

export const LoadingOverlay = ({ message = "Loading..." }: { message?: string }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 flex flex-col items-center">
      <LoadingSpinner />
      <p className="mt-4 text-gray-700">{message}</p>
    </div>
  </div>
);

export const LoadingCard = ({ message = "Loading..." }: { message?: string }) => (
  <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
    <LoadingSpinner />
    <p className="mt-4 text-gray-600">{message}</p>
  </div>
);
