import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Play, 
  ChevronDown, 
  ChevronRight 
} from 'lucide-react';

// Example expressions - Real jexl-extended functions with contexts
const examples = [
  {
    title: "String Manipulation",
    expression: 'text|uppercase|split(separator)|join(replacement)',
    description: "Transform string to uppercase and replace spaces with dashes",
    context: {
      text: "Hello World",
      separator: " ",
      replacement: "-"
    }
  },
  {
    title: "Array Operations", 
    expression: 'users|filter(\'value.active\')|map(\'value.name\')|sort()',
    description: "Filter active users and get their names sorted",
    context: {
      users: [
        { name: "Alice", age: 28, active: true, department: "Engineering" },
        { name: "Bob", age: 32, active: false, department: "Sales" },
        { name: "Charlie", age: 24, active: true, department: "Marketing" },
        { name: "Diana", age: 30, active: true, department: "Engineering" }
      ]
    }
  },
  {
    title: "Numeric Aggregations",
    expression: 'products|map(\'value.price\')|sum',
    description: "Calculate total price of all products",
    context: {
      products: [
        { name: "Laptop", price: 999.99, category: "Electronics", inStock: true },
        { name: "Book", price: 19.99, category: "Education", inStock: false },
        { name: "Coffee", price: 4.50, category: "Food", inStock: true }
      ]
    }
  },
  {
    title: "Complex Filtering",
    expression: 'users|filter(\'value.department == "Engineering" && value.active\')|length',
    description: "Count active users in Engineering department",
    context: {
      users: [
        { name: "Alice", age: 28, active: true, department: "Engineering" },
        { name: "Bob", age: 32, active: false, department: "Sales" },
        { name: "Charlie", age: 24, active: true, department: "Marketing" },
        { name: "Diana", age: 30, active: true, department: "Engineering" }
      ]
    }
  },
  {
    title: "String Functions",
    expression: '"hello world"|substringBefore(" ")|uppercase',
    description: "Extract text before space and convert to uppercase",
    context: {
    }
  },
  {
    title: "Date Operations",
    expression: 'now()|dateTimeAdd("days", 7)|dateTimeFormat("yyyy-MM-dd")',
    description: "Add 7 days to current date and format",
    context: {
    }
  },
  {
    title: "Object Transformation",
    expression: 'keyValuePairs|toObject',
    description: "Convert array of key-value pairs to object",
    context: {
      keyValuePairs: [["name","John"], ["age",30], ["city","New York"]]
    }
  },
  {
    title: "Base64 Encoding",
    expression: 'message|base64Encode|base64Decode',
    description: "Encode to base64 and decode back",
    context: {
      message: "hello world"
    }
  },
  {
    title: "Boolean Logic",
    expression: 'users|any(\'value.age > 30\')',
    description: "Check if any user is older than 30",
    context: {
      users: [
        { name: "Alice", age: 28, active: true },
        { name: "Bob", age: 32, active: false },
        { name: "Charlie", age: 24, active: true }
      ],
      ageLimit: 30
    }
  },
  {
    title: "Number Formatting",
    expression: 'revenue|formatNumber("0,0.000")',
    description: "Format number with thousands separator and decimals",
    context: {
      revenue: 16325.62,
      expenses: 8432.15,
      profit: 7893.47
    }
  },
  {
    title: "Conditional Case",
    expression: 'users[0].department|case("Engineering","Tech","Sales","Business","Other")',
    description: "Use case statement for conditional values",
    context: {
      users: [
        { name: "Alice", age: 28, active: true, department: "Engineering" },
        { name: "Bob", age: 32, active: false, department: "Sales" },
        { name: "Charlie", age: 24, active: true, department: "Marketing" }
      ]
    }
  },
  {
    title: "Array Reduce",
    expression: 'users|reduce("accumulator + value.age", 0)',
    description: "Sum all user ages using reduce",
    context: {
      users: [
        { name: "Alice", age: 28, active: true },
        { name: "Bob", age: 32, active: false },
        { name: "Charlie", age: 24, active: true },
        { name: "Diana", age: 30, active: true }
      ]
    }
  }
];

interface ExamplesProps {
  onLoadExample: (expression: string, context: string) => void;
}

export function Examples({ onLoadExample }: ExamplesProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleLoadExample = (example: typeof examples[0]) => {
    onLoadExample(example.expression, JSON.stringify(example.context, null, 2));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-lg font-semibold hover:text-foreground/80 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        Examples
      </button>
      
      {/* Examples List */}
      {isExpanded && (
        <div className="space-y-3">
          {examples.map((example, index) => (
            <Card key={index} className="group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium">{example.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{example.description}</p>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => handleLoadExample(example)}
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Load this example</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <pre className="text-xs bg-muted p-3 rounded text-muted-foreground font-mono whitespace-pre-wrap break-all">
                  {example.expression}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
