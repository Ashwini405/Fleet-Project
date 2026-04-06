import React from "react";
import { StatCard } from "./StatCard";
import { CalendarClock, Wrench, Navigation2, Fuel } from "lucide-react";

export const RenewalWidget = ({ data }) => {
  return (
    <StatCard title="Vehicle Renewal Reminders" icon={CalendarClock} className="h-full">
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs md:text-sm text-gray-600">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500">
            <tr>
              <th className="py-2 px-2 md:px-4">Truck ID</th>
              <th className="py-2 px-2 md:px-4">Due Date</th>
              <th className="py-2 px-2 md:px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-800">{item.id}</td>
                <td className="py-2 md:py-3 px-2 md:px-4">{item.dueDate}</td>
                <td className="py-2 md:py-3 px-2 md:px-4">
                  <span className="text-[10px] px-1.5 md:px-2 py-1 bg-red-100 text-red-700 rounded-full font-bold uppercase">{item.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StatCard>
  );
};

export const ServiceWidget = ({ data }) => {
  return (
    <StatCard title="Vehicle Service Reminders" icon={Wrench} className="h-full">
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs md:text-sm text-gray-600">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500">
            <tr>
              <th className="py-2 px-2 md:px-4">Truck ID</th>
              <th className="py-2 px-2 md:px-4">Due Date</th>
              <th className="py-2 px-2 md:px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-800">{item.id}</td>
                <td className="py-2 md:py-3 px-2 md:px-4">{item.dueDate}</td>
                <td className="py-2 md:py-3 px-2 md:px-4">
                  <span className="text-[10px] px-1.5 md:px-2 py-1 bg-red-100 text-red-700 rounded-full font-bold uppercase">{item.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StatCard>
  );
};

export const TripDetailsWidget = ({ data }) => {
  return (
    <StatCard title="Current Trip Details" icon={Navigation2} className="h-full border-l-4 border-l-blue-500">
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs md:text-sm text-gray-600">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500">
            <tr>
              <th className="py-2 px-2 md:px-4">Truck No</th>
              <th className="py-2 px-2 md:px-4">Destination</th>
              <th className="py-2 px-2 md:px-4">Loaded Date</th>
              <th className="py-2 px-2 md:px-4">KMS</th>
              <th className="py-2 px-2 md:px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-800">{item.id}</td>
                <td className="py-2 md:py-3 px-2 md:px-4">{item.destination}</td>
                <td className="py-2 md:py-3 px-2 md:px-4">{item.loadedDate}</td>
                <td className="py-2 md:py-3 px-2 md:px-4">{item.kms}</td>
                <td className="py-2 md:py-3 px-2 md:px-4">
                   <span className="text-[10px] px-1.5 md:px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-bold uppercase">{item.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StatCard>
  );
};

export const FuelWidget = ({ data }) => {
  return (
    <StatCard title="Fuel Consumption" icon={Fuel} className="h-full">
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs md:text-sm text-gray-600">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500">
            <tr>
              <th className="py-2 px-2 md:px-4">Truck ID</th>
              <th className="py-2 px-2 md:px-4">Fuel Used</th>
              <th className="py-2 px-2 md:px-4">Efficiency</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-800">{item.id}</td>
                <td className="py-2 md:py-3 px-2 md:px-4">{item.fuelUsed}</td>
                <td className="py-2 md:py-3 px-2 md:px-4">
                  <span className="text-[10px] px-1.5 md:px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold uppercase">{item.efficiency}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StatCard>
  );
};
