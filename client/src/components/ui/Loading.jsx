const Loading = ({ fullPage = false, size = 'md' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

  const spinner = (
    <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-primary ${sizes[size]}`} />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-cream z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full border-4 border-gray-200 border-t-primary h-12 w-12" />
          <p className="text-gray-500 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  return <div className="flex justify-center py-10">{spinner}</div>;
};

export default Loading;
