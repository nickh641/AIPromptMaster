import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Prompt } from "@shared/schema";

export default function ScenariosPage() {
  const [, navigate] = useLocation();
  
  // Fetch all prompts/scenarios
  const { data: scenarios = [], isLoading } = useQuery<Prompt[]>({
    queryKey: ["/api/prompts"],
  });

  const handleStartScenario = (id: number) => {
    navigate(`/chat?id=${id}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 pt-8">
      <h1 className="text-2xl font-bold mb-6">Available Training Scenarios</h1>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="shadow-sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : scenarios && scenarios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario: Prompt) => (
            <Card key={scenario.id} className="shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">{scenario.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-sm mb-2">
                  <span className="font-medium">Category:</span> Crisis Intervention
                </p>
                <p className="text-gray-500 text-sm">
                  <span className="font-medium">Difficulty:</span> Intermediate
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                  onClick={() => handleStartScenario(scenario.id)}
                >
                  Start Scenario
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No scenarios are currently available.</p>
          <p className="text-gray-500">Please check back later or contact your instructor.</p>
        </div>
      )}
    </div>
  );
}