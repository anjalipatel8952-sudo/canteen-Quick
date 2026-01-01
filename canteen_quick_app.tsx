import React, { useState, useEffect } from 'react';
import { ShoppingCart, Clock, CheckCircle, ChefHat, QrCode, DollarSign, X, Plus, Minus, ArrowLeft, User, LogOut } from 'lucide-react';

const CanteenQuick = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentOrder, setCurrentOrder] = useState(null);

  const menuItems = [
    { id: 1, name: 'Veg Sandwich', price: 40, category: 'Snacks', image: '🥪', available: true },
    { id: 2, name: 'Samosa', price: 15, category: 'Snacks', image: '🥟', available: true },
    { id: 3, name: 'Pav Bhaji', price: 60, category: 'Meals', image: '🍛', available: true },
    { id: 4, name: 'Thali', price: 80, category: 'Meals', image: '🍱', available: true },
    { id: 5, name: 'Chai', price: 10, category: 'Drinks', image: '☕', available: true },
    { id: 6, name: 'Cold Coffee', price: 30, category: 'Drinks', image: '🥤', available: true },
    { id: 7, name: 'Dosa', price: 50, category: 'Meals', image: '🥞', available: true },
    { id: 8, name: 'Maggi', price: 35, category: 'Snacks', image: '🍜', available: true },
  ];

  const categories = ['All', 'Snacks', 'Meals', 'Drinks'];

  const addToCart = (item) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(i => i.id !== id));
  };

  const getTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const createOrder = () => {
    const order = {
      id: `ORD${Date.now()}`,
      items: [...cart],
      total: getTotal(),
      student: user.name,
      orderStatus: 'PENDING_PAYMENT',
      paymentStatus: 'NOT_PAID',
      paymentMethod: null,
      timestamp: new Date().toISOString(),
      cashToken: null,
      tokenExpiry: null,
    };
    setOrders([...orders, order]);
    setCurrentOrder(order);
    setCart([]);
    setView('payment-selection');
  };

  const selectOnlinePayment = () => {
    const updated = orders.map(o => 
      o.id === currentOrder.id 
        ? { ...o, paymentMethod: 'ONLINE', paymentStatus: 'PAID_ONLINE_PENDING' } 
        : o
    );
    setOrders(updated);
    setCurrentOrder(updated.find(o => o.id === currentOrder.id));
    setView('qr-payment');
  };

  const selectCashPayment = () => {
    const cashToken = `C-${Math.floor(Math.random() * 100)}`;
    const expiry = Date.now() + 5 * 60 * 1000;
    const updated = orders.map(o => 
      o.id === currentOrder.id 
        ? { ...o, paymentMethod: 'CASH', paymentStatus: 'UNPAID_CASH', orderStatus: 'AWAITING_CASH', cashToken, tokenExpiry: expiry } 
        : o
    );
    setOrders(updated);
    setCurrentOrder(updated.find(o => o.id === currentOrder.id));
    setView('cash-token');
  };

  const verifyOnlinePayment = (orderId) => {
    const updated = orders.map(o => 
      o.id === orderId 
        ? { ...o, paymentStatus: 'PAID_ONLINE', orderStatus: 'CONFIRMED', foodToken: `F-${Math.floor(Math.random() * 100)}` } 
        : o
    );
    setOrders(updated);
    if (currentOrder?.id === orderId) {
      setCurrentOrder(updated.find(o => o.id === orderId));
      setView('order-status');
    }
  };

  const confirmCashPayment = (orderId) => {
    const updated = orders.map(o => 
      o.id === orderId 
        ? { ...o, paymentStatus: 'PAID_CASH', orderStatus: 'CONFIRMED', foodToken: `F-${Math.floor(Math.random() * 100)}` } 
        : o
    );
    setOrders(updated);
    if (currentOrder?.id === orderId) {
      setCurrentOrder(updated.find(o => o.id === orderId));
      setView('order-status');
    }
  };

  const updateOrderStatus = (orderId, status) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, orderStatus: status } : o);
    setOrders(updated);
    if (currentOrder?.id === orderId) {
      setCurrentOrder(updated.find(o => o.id === orderId));
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      orders.forEach(o => {
        if (o.tokenExpiry && now > o.tokenExpiry && o.orderStatus === 'AWAITING_CASH') {
          updateOrderStatus(o.id, 'CANCELLED');
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [orders]);

  const filteredMenu = selectedCategory === 'All' ? menuItems : menuItems.filter(i => i.category === selectedCategory);

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transform hover:scale-105 transition-transform">
          <h1 className="text-4xl font-bold text-purple-600 mb-2 text-center">Canteen Quick</h1>
          <p className="text-gray-600 text-center mb-8">Skip the queue, order smart</p>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="College Email or Roll Number" 
              className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
            />
            <input 
              type="text" 
              placeholder="Your Name" 
              className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
              id="student-name"
            />
            <button 
              onClick={() => {
                const name = document.getElementById('student-name').value || 'Student';
                setUser({ name, role: 'student' });
                setView('menu');
              }}
              className="w-full bg-purple-600 text-white py-3 rounded-2xl font-semibold hover:bg-purple-700 transition"
            >
              Login as Student
            </button>
            <button 
              onClick={() => {
                setUser({ name: 'Admin', role: 'admin' });
                setView('admin');
              }}
              className="w-full bg-gray-800 text-white py-3 rounded-2xl font-semibold hover:bg-gray-900 transition"
            >
              Admin Panel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'menu' && user?.role === 'student') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-purple-50 pb-24">
        <div className="bg-white shadow-md sticky top-0 z-10 p-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-2">
              <User className="text-purple-600" size={24} />
              <span className="font-semibold text-gray-800">{user.name}</span>
            </div>
            <button onClick={() => { setUser(null); setView('login'); }} className="text-gray-600 hover:text-red-600">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-4">
          <h1 className="text-3xl font-bold text-purple-600 mb-6">Menu</h1>
          
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl font-medium whitespace-nowrap transition ${
                  selectedCategory === cat 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-purple-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenu.map(item => (
              <div key={item.id} className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transform hover:-translate-y-2 transition-all">
                <div className="text-6xl mb-4 text-center">{item.image}</div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">{item.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-purple-600">₹{item.price}</span>
                  <button 
                    onClick={() => addToCart(item)}
                    className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-purple-600 p-4 shadow-2xl">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{cart.length} items</p>
                <p className="text-2xl font-bold text-purple-600">₹{getTotal()}</p>
              </div>
              <button 
                onClick={() => setView('cart')}
                className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-purple-700 transition flex items-center gap-2"
              >
                <ShoppingCart size={20} />
                View Cart
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === 'cart') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setView('menu')} className="flex items-center gap-2 text-purple-600 mb-6 hover:text-purple-800">
            <ArrowLeft size={20} />
            Back to Menu
          </button>

          <h1 className="text-3xl font-bold text-purple-600 mb-6">Your Cart</h1>

          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div key={item.id} className="bg-white rounded-3xl shadow-lg p-4 flex items-center gap-4">
                <div className="text-4xl">{item.image}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{item.name}</h3>
                  <p className="text-purple-600 font-semibold">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="bg-gray-200 p-1 rounded-full hover:bg-gray-300">
                    <Minus size={16} />
                  </button>
                  <span className="font-bold w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="bg-purple-600 text-white p-1 rounded-full hover:bg-purple-700">
                    <Plus size={16} />
                  </button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center text-2xl font-bold">
              <span>Total</span>
              <span className="text-purple-600">₹{getTotal()}</span>
            </div>
          </div>

          <button 
            onClick={createOrder}
            className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-purple-700 transition"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    );
  }

  if (view === 'payment-selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-purple-50 p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-purple-600 mb-2 text-center">Select Payment Method</h1>
          <p className="text-gray-600 text-center mb-8">Order ID: {currentOrder?.id}</p>

          <div className="space-y-4">
            <div 
              onClick={selectOnlinePayment}
              className="bg-gradient-to-r from-green-400 to-green-600 text-white rounded-3xl shadow-2xl p-8 cursor-pointer hover:scale-105 transform transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <QrCode size={48} />
                <div>
                  <h2 className="text-2xl font-bold">Online Payment</h2>
                  <p className="text-green-100">Scan QR & Pay via UPI</p>
                </div>
              </div>
              <p className="text-lg font-semibold">₹{currentOrder?.total}</p>
            </div>

            <div 
              onClick={selectCashPayment}
              className="bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-3xl shadow-2xl p-8 cursor-pointer hover:scale-105 transform transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <DollarSign size={48} />
                <div>
                  <h2 className="text-2xl font-bold">Cash Payment</h2>
                  <p className="text-orange-100">Pay at counter with token</p>
                </div>
              </div>
              <p className="text-lg font-semibold">₹{currentOrder?.total}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'qr-payment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Scan QR to Pay</h1>
          
          <div className="bg-white border-4 border-gray-800 rounded-3xl p-6 mb-6">
            <div className="bg-gray-100 aspect-square rounded-2xl flex items-center justify-center mb-4">
              <QrCode size={200} className="text-gray-800" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-mono text-sm text-gray-600">UPI ID: canteen@ybl</p>
              <p className="font-mono text-sm text-gray-600">Order: {currentOrder?.id}</p>
              <p className="text-2xl font-bold text-green-600">₹{currentOrder?.total}</p>
            </div>
          </div>

          <p className="text-gray-600 text-center mb-6">Open any UPI app, scan this code and complete payment</p>

          {currentOrder?.paymentStatus === 'PAID_ONLINE_PENDING' ? (
            <div className="text-center">
              <div className="animate-pulse text-yellow-600 font-semibold mb-4">Waiting for confirmation...</div>
              <button 
                onClick={() => setView('menu')}
                className="text-purple-600 hover:text-purple-800 underline"
              >
                Back to Menu
              </button>
            </div>
          ) : (
            <button 
              onClick={() => {
                const updated = orders.map(o => 
                  o.id === currentOrder.id 
                    ? { ...o, paymentStatus: 'PAID_ONLINE_PENDING' } 
                    : o
                );
                setOrders(updated);
                setCurrentOrder(updated.find(o => o.id === currentOrder.id));
              }}
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition"
            >
              I Have Paid
            </button>
          )}
        </div>
      </div>
    );
  }

  if (view === 'cash-token') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Cash Payment Token</h1>
          
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-8 mb-6">
            <p className="text-white text-center mb-4">Show this token at counter</p>
            <div className="bg-white rounded-2xl p-6 text-center">
              <p className="text-6xl font-bold text-orange-600">{currentOrder?.cashToken}</p>
            </div>
            <p className="text-white text-center mt-4 font-semibold">Amount: ₹{currentOrder?.total}</p>
          </div>

          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl p-4 mb-6">
            <p className="text-yellow-800 text-center font-semibold">⏰ Valid for 5 minutes</p>
          </div>

          <p className="text-gray-600 text-center mb-6">Pay cash at counter and show this token</p>

          <button 
            onClick={() => setView('menu')}
            className="w-full bg-gray-600 text-white py-3 rounded-2xl font-semibold hover:bg-gray-700 transition"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  if (view === 'order-status') {
    const statusSteps = ['CONFIRMED', 'PREPARING', 'COOKING', 'READY'];
    const currentIndex = statusSteps.indexOf(currentOrder?.orderStatus);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Order</h1>
          
          <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl p-8 mb-6 animate-pulse">
            <p className="text-white text-center mb-2">Food Token</p>
            <div className="bg-white rounded-2xl p-6 text-center">
              <p className="text-6xl font-bold text-purple-600">{currentOrder?.foodToken}</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {statusSteps.map((status, idx) => (
              <div 
                key={status}
                className={`flex items-center gap-4 p-4 rounded-2xl transition ${
                  idx <= currentIndex ? 'bg-purple-100' : 'bg-gray-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  idx <= currentIndex ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {idx < currentIndex ? <CheckCircle size={20} /> : idx + 1}
                </div>
                <span className={`font-semibold ${idx <= currentIndex ? 'text-purple-600' : 'text-gray-600'}`}>
                  {status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>

          {currentOrder?.orderStatus === 'READY' && (
            <div className="bg-green-100 border-2 border-green-500 rounded-2xl p-6 mb-6 text-center">
              <p className="text-green-800 font-bold text-xl">🎉 Your order is ready!</p>
              <p className="text-green-700 mt-2">Collect from counter</p>
            </div>
          )}

          <button 
            onClick={() => { setView('menu'); setCurrentOrder(null); }}
            className="w-full bg-purple-600 text-white py-3 rounded-2xl font-semibold hover:bg-purple-700 transition"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  if (view === 'admin' && user?.role === 'admin') {
    const pendingPayment = orders.filter(o => o.orderStatus === 'PENDING_PAYMENT');
    const awaitingCash = orders.filter(o => o.orderStatus === 'AWAITING_CASH');
    const pendingVerification = orders.filter(o => o.paymentStatus === 'PAID_ONLINE_PENDING');
    const confirmed = orders.filter(o => o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PREPARING' || o.orderStatus === 'COOKING');
    const ready = orders.filter(o => o.orderStatus === 'READY');

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <button onClick={() => { setUser(null); setView('login'); }} className="bg-red-600 text-white px-4 py-2 rounded-2xl hover:bg-red-700">
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold text-orange-600 mb-4">⏳ Pending Payment</h2>
              <div className="space-y-3">
                {pendingPayment.map(o => (
                  <div key={o.id} className="bg-white rounded-2xl shadow p-4">
                    <p className="font-bold">{o.student} - {o.id}</p>
                    <p className="text-gray-600">₹{o.total}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-orange-600 mb-4">💰 Awaiting Cash</h2>
              <div className="space-y-3">
                {awaitingCash.map(o => (
                  <div key={o.id} className="bg-orange-100 rounded-2xl shadow p-4">
                    <p className="font-bold">{o.student} - Token: {o.cashToken}</p>
                    <p className="text-gray-800">₹{o.total}</p>
                    <button 
                      onClick={() => confirmCashPayment(o.id)}
                      className="mt-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 w-full"
                    >
                      Confirm Cash Paid
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-yellow-600 mb-4">🔍 Online Payment Pending</h2>
              <div className="space-y-3">
                {pendingVerification.map(o => (
                  <div key={o.id} className="bg-yellow-100 rounded-2xl shadow p-4">
                    <p className="font-bold">{o.student} - {o.id}</p>
                    <p className="text-gray-800">₹{o.total}</p>
                    <button 
                      onClick={() => verifyOnlinePayment(o.id)}
                      className="mt-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 w-full"
                    >
                      Verify Online Payment
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-green-600 mb-4">✅ Confirmed Orders</h2>
              <div className="space-y-3">
                {confirmed.map(o => (
                  <div key={o.id} className="bg-green-100 rounded-2xl shadow p-4">
                    <p className="font-bold">{o.student} - Token: {o.foodToken}</p>
                    <p className="text-sm text-gray-700">{o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => updateOrderStatus(o.id, 'PREPARING')}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 text-sm"
                      >
                        Preparing
                      </button>
                      <button 
                        onClick={() => updateOrderStatus(o.id, 'COOKING')}
                        className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-xl hover:bg-purple-700 text-sm"
                      >
                        Cooking
                      </button>
                      <button 
                        onClick={() => updateOrderStatus(o.id, 'READY')}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-xl hover:bg-green-700 text-sm"
                      >
                        Ready
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-bold text-purple-600 mb-4">🎉 Ready for Pickup</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ready.map(o => (
                <div key={o.id} className="bg-purple-100 rounded-2xl shadow p-4">
                  <p className="font-bold text-2xl text-purple-600">{o.foodToken}</p>
                  <p className="text-gray-700">{o.student}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CanteenQuick;