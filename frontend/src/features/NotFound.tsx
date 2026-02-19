

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="text-center">

        {/* 404 Number */}
        <h1 className="text-8xl font-extrabold text-indigo-600 drop-shadow-sm">
          404
        </h1>

        {/* Title */}
        <h2 className="mt-4 text-2xl md:text-3xl font-semibold text-gray-800">
          Oops! Page not found
        </h2>

        {/* Description */}
        <p className="mt-3 text-gray-600 max-w-md mx-auto">
          The page you're looking for doesn’t exist or may have been moved.
          Please check the URL or return to the dashboard.
        </p>

      
      </div>
    </div>
  );
};

export default NotFound;
