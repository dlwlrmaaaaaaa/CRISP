export const getAddressFromCoordinates = async (latitude, longitude) => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

  await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay of 1 second between requests

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "CRISP/1.0.9 crisp.uccbscs@gmail.com",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error fetching address:", errorText);
      return null;
    }

    const data = await response.json();
    if (data && data.address) {
      const { residential, road, neighbourhood } = data.address;
      const addressParts = [residential, road, neighbourhood].filter(Boolean);
      return addressParts.join(", ") || "Address not found";
    } else {
      console.error("Nominatim API error:", data);
      return "Address not found";
    }
  } catch (error) {
    console.error("Error fetching address:", error);
    return null;
  }
};
