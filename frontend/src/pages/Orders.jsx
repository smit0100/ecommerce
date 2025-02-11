import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import { toast } from "react-toastify";

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);

  const [orderData, setOrderData] = useState([]);

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null;
      }

      const res = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } }
      );

      if (res.data.success) {
        let allOrdersItem = [];

        res.data.orders.map((order) => {
          order.items.map((item) => {
            item["status"] = order.status;
            item["payment"] = order.payment;
            item["paymentMethod"] = order.paymentMethod;
            item["date"] = order.date;

            allOrdersItem.push(item);
          });
        });

        setOrderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleReturn = async (orderId, type) => {
    try {
      const reason = prompt(`Please provide a reason for ${type}:`);
      if (!reason) return;

      const res = await axios.post(
        backendUrl + "/api/order/return-request",
        { orderId, type, reason },
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        loadOrderData();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div>
        {orderData.slice(0, 4).map((item, i) => (
          <div
            key={i}
            className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div className="flex items-start gap-6 text-sm">
              <img src={item.image[0]} className="w-16 sm:w-20" alt="" />
              <div>
                <p className="sm:text-base font-medium">{item.name}</p>
                <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                  <p>
                    {currency}
                    {item.price}
                  </p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                </div>
                <p className="mt-1">
                  Date:{" "}
                  <span className="text-gray-400">
                    {new Date(item.date).toDateString()}
                  </span>
                </p>
                <p className="mt-1">
                  Payment:{" "}
                  <span className="text-gray-400">{item.paymentMethod}</span>
                </p>
              </div>
            </div>

            <div className="md:w-1/2 flex justify-between">
              <div className="flex items-center gap-2">
                <p className="min-w-2 h-2 rounded-full bg-green-500"></p>
                <p className="text-sm md:text-base">{item.status}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={loadOrderData}
                  className="border px-4 py-2 text-sm text-medium rounded-sm"
                >
                  Track Order
                </button>
                {new Date() - new Date(item.date) <= 7 * 24 * 60 * 60 * 1000 && !item.returnRequest?.status && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReturn(item._id, 'return')}
                      className="border px-4 py-2 text-sm text-medium rounded-sm bg-red-50"
                    >
                      Return
                    </button>
                    <button
                      onClick={() => handleReturn(item._id, 'replacement')}
                      className="border px-4 py-2 text-sm text-medium rounded-sm bg-blue-50"
                    >
                      Replace
                    </button>
                  </div>
                )}
                {item.returnRequest?.status && (
                  <p className="text-sm text-gray-500">
                    {item.returnRequest.type} request: {item.returnRequest.status}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
