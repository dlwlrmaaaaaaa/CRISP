import { collection, getDocs, getFirestore, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { app } from "@/firebase/firebaseConfig";

const db = getFirestore(app);

export class Vote {

  public user_id: string;
  public vote: string;

  constructor(user_id: string, vote: string) {
    this.user_id = user_id;
    this.vote = vote;
  }

  public static async handleDownvote(reportId: string, category: string, userId: string): Promise<void>{
    try {
      const reportRef = doc(
        db,
        `reports/${category.toLowerCase()}/reports/${reportId}/votes/${userId}`
      );
      console.log("Document Reference:", reportRef.path);
      const reportSnap = await getDoc(reportRef);
      const data = {
        user_id: userId,
        vote: "downvote",
      };

      if (reportSnap.exists()) {
        const existingVote = reportSnap.data().vote;

        if (existingVote === "downvote") {
          await deleteDoc(reportRef);
          console.log("Remove downvote!");
        } else {
          await deleteDoc(reportRef);
          await setDoc(reportRef, data);
          console.log("Update Vote!");
        }
      } else {
        await setDoc(reportRef, data);
        console.log("Upvote added successfully!", reportId);
      }
    } catch (error: any) {
      console.error("Error handling downvote:", error.message);
    }
  }

  public static async handleUpvote(reportId: string, category: string, userId: string): Promise<void> {
      try {
        const reportRef = doc(
          db,
          `reports/${category.toLowerCase()}/reports/${reportId}/votes/${userId}`
        );
        console.log("Document Reference:", reportRef.path);
        const reportSnap = await getDoc(reportRef);
        const data = {
          user_id: userId,
          vote: "upvote",
        };
  
        if (reportSnap.exists()) {
          const existingVote = reportSnap.data().vote;
          if (existingVote === "upvote") {
            await deleteDoc(reportRef);
            console.log("Remove upvote!");
          } else {
            await deleteDoc(reportRef);
            await setDoc(reportRef, data);
            console.log("Update Vote!");
          }
        } else {
          await setDoc(reportRef, data);
          console.log("Upvote added successfully!", reportId);
        }
    } catch (error) {
      console.error("Error during upvote:", error);
    }
  
}

  public static async getAllVotes(): Promise<{ reportId: string; votes: Vote[] }[]> {
    const categories = ["fires", "street light", "potholes", "floods", "others", "road accidents"];
    const allVotes: { reportId: string; votes: Vote[] }[] = [];
  
    try {
      // Fetch all reports in parallel for each category
      await Promise.all(
        categories.map(async (category) => {
          const reportCollection = collection(db, `reports/${category}/reports`);
          const reportSnapshot = await getDocs(reportCollection);
  
          // Fetch votes for each report in parallel
          const reportVotesPromises = reportSnapshot.docs.map(async (reportDoc) => {
            const reportId = reportDoc.id;
            const votesCollection = collection(db, `reports/${category}/reports/${reportId}/votes`);
            const votesSnapshot = await getDocs(votesCollection);
  
            // Map vote documents to Vote instances
            const votes = votesSnapshot.docs.map((voteDoc) => {
              const voteData = voteDoc.data();
              return new Vote(voteData.user_id, voteData.vote);
            });
  
            return { reportId, votes };
          });
  
          // Wait for all vote fetching promises to resolve and add them to allVotes
          const reportVotes = await Promise.all(reportVotesPromises);
          allVotes.push(...reportVotes);
        })
      );
  
      return allVotes;
    } catch (error) {
      console.error("Error retrieving all votes:", error);
      return [];
    }
  }
  
  
}
