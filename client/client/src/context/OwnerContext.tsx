import { createContext, use, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../configs/api";



const OwnerContext = createContext<any>(null);



export const OwnerProvider = ({ children }: any) => {
    const [buildings, setBuildings] = useState([]);
    const [managers, setManagers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [notifications, setNotifications] = useState([]);

    // Fetch and set data for buildings, managers, employees, tenants, notifications
    const getOwnerData = async () => {
        try {
            const { data } = await api.get("/api/owner/dashboard-data");
            setBuildings(data.data.buildings);
            setManagers(data.data.managers);
            setEmployees(data.data.employees);
            // setTenants(data.data.tenants);
            // setNotifications(data.data.notifications);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    }

   useEffect(()=> {
    getOwnerData();
   },[])

    return (
        <OwnerContext.Provider value={{ buildings, setBuildings, managers, setManagers, employees, setEmployees, tenants, setTenants, notifications, setNotifications }}>
            {children}
        </OwnerContext.Provider>
    );
};


export const useOwner = () => useContext(OwnerContext);
