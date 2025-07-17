import { constructTeamMembersDetails } from "@/utils/helperFunctions";
import { useState, useEffect } from "react";

const useTeamMembersDetails = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const members = await constructTeamMembersDetails();
      setTeamMembers(members || []);
    } catch (err) {
      setError(err.message || "Failed to fetch team members");
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  return {
    teamMembers,
    loading,
    error,
    refetch: fetchTeamMembers,
  };
};

export default useTeamMembersDetails;
