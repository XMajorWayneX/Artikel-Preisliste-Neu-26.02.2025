import React, { useState, useEffect } from 'react';
import ItemSearch from './components/ItemSearch';
import ItemManagement from './components/ItemManagement';
import RegionManagement from './components/RegionManagement';
import LandingPage from './components/LandingPage';
import { db, itemsCollection, regionsCollection, addDoc, setDoc, doc, deleteDoc, onSnapshot, collection, auth, onAuthStateChanged, signOut } from './firebase';
import { getDoc } from 'firebase/firestore';

function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [items, setItems] = useState([]);
  const [regions, setRegions] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const adminDocRef = doc(db, 'admins', user.uid);
        const adminDocSnapshot = await getDoc(adminDocRef);

        if (adminDocSnapshot.exists() && adminDocSnapshot.data().isAdmin === true) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let itemsUnsubscribe;
    let regionsUnsubscribe;

    if (user) {
      itemsUnsubscribe = onSnapshot(itemsCollection, (snapshot) => {
        const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(itemsData);
      });

      regionsUnsubscribe = onSnapshot(regionsCollection, (snapshot) => {
        const regionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRegions(regionsData);
      });
    }

    return () => {
      if (itemsUnsubscribe) itemsUnsubscribe();
      if (regionsUnsubscribe) regionsUnsubscribe();
    };
  }, [user]);

  const handleAddItem = async (newItem) => {
    try {
      await addDoc(itemsCollection, newItem);
    } catch (error) {
      console.error("Error adding item", error);
    }
  };

  const handleUpdateItem = async (updatedItem) => {
    try {
      const itemDocRef = doc(db, 'items', updatedItem.id);
      await setDoc(itemDocRef, updatedItem);
    } catch (error) {
      console.error("Error updating item", error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const itemDocRef = doc(db, 'items', itemId);
      await deleteDoc(itemDocRef);
    } catch (error) {
      console.error("Error deleting item", error);
    }
  };

  const handleAddRegion = async (newRegion) => {
    try {
      await addDoc(regionsCollection, newRegion);
    } catch (error) {
      console.error("Error adding region", error);
    }
  };

  const handleUpdateRegion = async (updatedRegion) => {
    try {
      const regionDocRef = doc(db, 'regions', updatedRegion.id);
      await setDoc(regionDocRef, updatedRegion);
    } catch (error) {
      console.error("Error updating region", error);
    }
  };

  const handleDeleteRegion = async (regionId) => {
    try {
      const regionDocRef = doc(db, 'regions', regionId);
      await deleteDoc(regionDocRef);
    } catch (error) {
      console.error("Error deleting region", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  if (!user) {
    return <LandingPage onSignIn={() => {}} />;
  }

  return (
    <div className="container">
      <nav className="nav">
        <button onClick={() => setActiveTab('search')} className={activeTab === 'search' ? 'active' : ''}>Suchen</button>
        {isAdmin && (
          <>
            <button onClick={() => setActiveTab('manageItems')} className={activeTab === 'manageItems' ? 'active' : ''}>Artikel erstellen</button>
            <button onClick={() => setActiveTab('manageRegions')} className={activeTab === 'manageRegions' ? 'active' : ''}>Gebiete verwalten</button>
          </>
        )}
        <button onClick={handleSignOut}>Abmelden</button>
      </nav>

      {activeTab === 'search' && <ItemSearch items={items} regions={regions} />}
      {activeTab === 'manageItems' && isAdmin && (
        <ItemManagement
          items={items}
          regions={regions}
          onAddItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
        />
      )}
      {activeTab === 'manageRegions' && isAdmin && (
        <RegionManagement
          regions={regions}
          onAddRegion={handleAddRegion}
          onUpdateRegion={handleUpdateRegion}
          onDeleteRegion={handleDeleteRegion}
          items={items}
          onUpdateItem={handleUpdateItem}
        />
      )}
    </div>
  );
}

export default App;
