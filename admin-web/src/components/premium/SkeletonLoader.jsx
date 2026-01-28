const SkeletonLoader = ({ variant = 'card', count = 1 }) => {
    const renderCard = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gray-200"></div>
                <div className="w-16 h-6 rounded-full bg-gray-200"></div>
            </div>
            <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-8 w-32 bg-gray-200 rounded"></div>
            </div>
        </div>
    );

    const renderTable = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="space-y-4">
                <div className="h-6 w-48 bg-gray-200 rounded"></div>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="h-10 flex-1 bg-gray-200 rounded"></div>
                            <div className="h-10 flex-1 bg-gray-200 rounded"></div>
                            <div className="h-10 flex-1 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderChart = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-6 w-40 bg-gray-200 rounded mb-6"></div>
            <div className="flex items-end gap-2 h-64">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="flex-1 bg-gray-200 rounded-t"
                        style={{ height: `${Math.random() * 100}%` }}
                    ></div>
                ))}
            </div>
        </div>
    );

    const renderList = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                            <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const variants = {
        card: renderCard,
        table: renderTable,
        chart: renderChart,
        list: renderList
    };

    const Renderer = variants[variant] || renderCard;

    return (
        <>
            {[...Array(count)].map((_, i) => (
                <div key={i}>{Renderer()}</div>
            ))}
        </>
    );
};

export default SkeletonLoader;
