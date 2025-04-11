import React, { useEffect, useState } from "react";
import ImageModal from "./ImageModal";

const Feedback = ({ isVisible, onClose, attachment, feedback }) => {
  if (!isVisible) return null;

  const [showImageModal, setShowImageModal] = useState(false);
  const [description, setDescription] = useState('')
  const [proof, setProof] = useState('')
  const handleImageClick = () => {
    setShowImageModal(true);
  };

  useEffect(() => feedback.forEach(({description, proof, id}) => {setDescription(description); setProof(proof)}),[feedback])
  return (
    <>
      <div className="fixed inset-0 w-full h-screen bg-black/75 flex items-center justify-center z-40">
        <div
          className="relative flex items-center justify-center rounded-lg w-screen h-screen"
          id="container"
          onClick={(e) => {
            if (e.target.id === "container") {
              onClose();
              //   setActiveDetails(false);
            }
          }}
        >
          <div className="relative bg-second w-[75vw] lg:w-[50vw] flex flex-col items-center justify-center p-8 md:p-10 rounded-xl shadow-xl overflow-hidden">
            {/* bg squares */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 -top-24 -left-24"></div>
              <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-2/3 left-0"></div>
              <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-0 left-1/3"></div>
              <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 -top-40 -right-10"></div>
              <div className="absolute h-[30vh] w-[30vh] bg-square rounded-[20px] rotate-45 top-96 left-2/3"></div>
            </div>
            <div className="relative w-full flex items-center justify-center z-20">
              <p className="text-md text-main uppercase font-extrabold">
                Report Details
              </p>
            </div>
            <div className="w-full flex flex-col md:flex-row lg:flex-row justify-center items-start gap-4 lg:gap-12 z-20">
              <div className="w-full flex flex-col items-center justify-center py-2">
                <div className="flex justify-start items-center w-full py-2">
                  <p className="text-xs font-semibold ">Remarks</p>
                </div>
                <div className="p-4 rounded-md bg-white w-full border text-gray-500 border-main">
                  <textarea
                    name=""
                    id=""
                    rows={10}
                    className="outline-none bg-white w-full resize-none text-xs font-normal"
                    placeholder="Actions or Remarks"
                    value={description}
                    readOnly={true}
                  ></textarea>
                </div>
              </div>
              <div className="w-full flex flex-col items-center justify-center py-2">
                <div className="flex justify-start items-center w-full py-2">
                  <p className="text-xs font-semibold ">Proof</p>
                </div>
                <div
                  className="w-full h-[200px] rounded-md overflow-hidden cursor-pointer border border-main mb-3"
                  onClick={handleImageClick}
                >
                  <img
                    src={proof}
                    className="w-full h-full object-cover object-center hover:scale-105 ease-in-out duration-500"
                    alt={`Image proof`}
                  />
                </div>
                <div className="w-full flex flex-row gap-4 items-center justify-end mt-4">
                  <button
                    className="py-2 px-3 border border-main bg-white text-main rounded-lg text-xs font-bold hover:scale-105 ease-in-out duration-500"
                    onClick={() => {
                      onClose();
                    }}
                  >
                    CLOSE
                  </button>
                </div>
              </div>
              {/* <button
                className="absolute text-white top-7 right-5 text-5xl font-bold"
                onClick={onClose}
              >
                ×
              </button> */}
            </div>
          </div>
        </div>
      </div>
      <ImageModal
        isVisible={showImageModal}
        onClose={() => setShowImageModal(false)}
        attachment={attachment}
      />
    </>
  );
};

export default Feedback;
