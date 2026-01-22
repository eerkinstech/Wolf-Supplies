import React from 'react';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
const AdminLayout = ({ children, activeTab }) => {
    return (
        <div className="flex bg-gray-100 min-h-screen">
            {/* Sidebar */}
            <AdminSidebar activeTab={activeTab} />

            {/* Main Content */}
            <div className="flex-1 ml-64 overflow-auto">
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;
