import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

const StatCard = ({ title, value, change, changeType, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600',
        red: 'from-red-500 to-red-600',
        cyan: 'from-cyan-500 to-cyan-600'
    };

    const getTrendIcon = () => {
        if (changeType === 'up') return <ArrowUp className="w-4 h-4" />;
        if (changeType === 'down') return <ArrowDown className="w-4 h-4" />;
        return <Minus className="w-4 h-4" />;
    };

    const getTrendColor = () => {
        if (changeType === 'up') return 'text-green-600 bg-green-100';
        if (changeType === 'down') return 'text-red-600 bg-red-100';
        return 'text-gray-600 bg-gray-100';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-md`}>
                    {Icon && <Icon className="w-6 h-6 text-white" />}
                </div>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getTrendColor()}`}>
                        {getTrendIcon()}
                        <span>{Math.abs(change)}%</span>
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <p className="text-sm text-gray-600 font-medium">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;
