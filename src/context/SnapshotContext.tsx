"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import NewOrderAlert from "@/components/shared/NewOrderAlert";

interface SnapshotContextType {
  showPopup: (order: any, initialTimer: any) => void;
  closePopup: () => void;
}

const SnapshotContext = createContext<SnapshotContextType | undefined>(
  undefined
);

// Hook to use the SnapshotContext
export const useSnapshot = () => {
  const context = useContext(SnapshotContext);
  if (!context) {
    throw new Error("useSnapshot must be used within a SnapshotProvider");
  }
  return context;
};

export const SnapshotProvider = ({ children }: { children: ReactNode }) => {
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  // Function to show the popup
  const showPopup = (order: any, initialTimer: any) => {
    setCurrentOrder((prev: any) => {
      return { ...order, initialTimer };
    });
    setPopupOpen(true);
  };

  // Function to close the popup
  const closePopup = () => {
    setPopupOpen(false);
    setCurrentOrder(null);
  };

  return (
    <SnapshotContext.Provider value={{ showPopup, closePopup }}>
      {children}

      {/* Render the popup conditionally based on state */}
      {popupOpen && currentOrder && (
        <NewOrderAlert
          open={popupOpen}
          setOpen={setPopupOpen}
          order={currentOrder}
        />
      )}
    </SnapshotContext.Provider>
  );
};
