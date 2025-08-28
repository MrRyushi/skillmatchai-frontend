'use client';
import Image from "next/image";
import { useEffect } from "react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"


export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");

  // Output states
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [matchedSkills, setMatchedSkills] = useState<string[]>([]);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  // For progress bar
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0) 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    setProgress(20)
    if (!file) {
      alert("Please upload a resume!");
      return;
    }

    if (!jobDesc) {
      alert("Please enter a job description!");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("job_description", jobDesc);
    setProgress(60)
    try {
      const res = await fetch("https://skillmatchai-backend.onrender.com/match", { // http://127.0.0.1:8000/match
        method: "POST",
        body: formData,
      });
      const data = await res.json();
  
      setMatchScore(data.match_score);
      setMatchedSkills(data.matched_skills);
      setMissingSkills(data.missing_skills);
      setRecommendations(data.recommendations);
      setProgress(100)
    } catch (err) {
      console.error("Error sending data:", err);
    } finally {
      setLoading(false)
    }

  };

  useEffect(() => {
  console.log("Updated Missing Skills:", missingSkills);
}, [missingSkills]);

  useEffect(() => {
    console.log("Updated Matched Skills:", matchedSkills);
  }, [matchedSkills]);


  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center p-10 sm:p-24 poppins space-y-10">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-center">Welcome to SkillMatch AI 💡</h1>
      </div>
      <form className="flex flex-col gap-3 justify-center items-center w-full sm:w-11/12 md:5/6 lg:w-1/2 xl:w-2/5s 2xl:w-1/3" onSubmit={handleSubmit}>
        <div className="w-full space-y-2">
          <Label htmlFor="file">Upload your Resume</Label>
          <Input id="file" type="file" className="hover:underline text-sm" onChange={(e) => setFile(e.target.files?.[0] || null)}/>
        </div>
        <div className="w-full space-y-2">
          <Label htmlFor="job_description">Paste your Job Description</Label>
          <Textarea placeholder="Paste your Job Description here." onChange={(e) => setJobDesc(e.target.value)}/>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Match Skills
          </button>
        </div>
      </form>

      {loading && (
        <div className="my-4">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground mt-2">Analyzing your resume...</p>
        </div>
      )}

      {!loading && (
      <div className="w-full sm:w-11/12 lg:w-1/2">
  
      {matchScore !== null && (
        <div>
          <Alert variant="default">
          <AlertTitle className="font-bold">Match Score</AlertTitle>
          <AlertDescription>
            {matchScore} / 100
          </AlertDescription>
        </Alert>
        </div>
      )}

  
      {matchedSkills && matchedSkills.length > 0 && (
        <div className="w-full">
          <Alert variant="default">
          <AlertTitle className="font-bold">Matched Skills</AlertTitle>
          <AlertDescription>
            {matchedSkills.map((skill, index) => (
              <div key={index}>- {skill}</div>  
            ))}
          </AlertDescription>
        </Alert>
        </div>
      )}

      {missingSkills && missingSkills.length > 0 && (<div className="w-full h-full">
        <Alert variant="destructive">
          <AlertTitle className="font-bold">Missing Skills!</AlertTitle>
          <AlertDescription>
            {missingSkills.map((skill, index) => (
              <div key={index}>- {skill}</div>
            ))}
          </AlertDescription>
        </Alert>
      </div>)}
      {recommendations && recommendations.length > 0 && (
        <div>
          <Alert variant="default">
          <AlertTitle className="font-bold">Recommendations</AlertTitle>
          <AlertDescription>
            {recommendations.map((rec, index) => (
              <div key={index}>- {rec}</div>  
            ))}
          </AlertDescription>
        </Alert>
        </div>
      )}
      </div> )}
    </div>
  );
}