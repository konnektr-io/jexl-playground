import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Search, 
  Save, 
  Play, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  RefreshCw 
} from 'lucide-react';
import { type SavedSession } from '@/lib/saved-sessions';

interface SavedSessionsProps {
  sessions: SavedSession[];
  loading: boolean;
  onLoadSession: (expression: string, context: string) => void;
  onSaveSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onUpdateSession: (sessionId: string, expression: string, context: string) => void;
  currentExpression: string;
  currentContext: string;
}

export function SavedSessions({ 
  sessions, 
  loading, 
  onLoadSession, 
  onSaveSession, 
  onDeleteSession,
  onUpdateSession,
  currentExpression,
  currentContext
}: SavedSessionsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter sessions based on search query
  const filteredSessions = sessions.filter(session =>
    session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.expression.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLoadSession = (session: SavedSession) => {
    onLoadSession(session.expression, session.context);
  };

  const handleDeleteSession = (sessionId: string, event: React.MouseEvent) => {
    console.log('Delete clicked for session:', sessionId);
    event.stopPropagation();
    // Temporarily remove confirm dialog for testing
    console.log('Calling onDeleteSession for session:', sessionId);
    onDeleteSession(sessionId);
  };

  const handleUpdateSession = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onUpdateSession(sessionId, currentExpression, currentContext);
  };

  const isSessionDifferent = (session: SavedSession): boolean => {
    return session.expression !== currentExpression || session.context !== currentContext;
  };

  const truncateExpression = (expression: string, maxLength: number = 40) => {
    return expression.length > maxLength 
      ? expression.substring(0, maxLength) + '...' 
      : expression;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-semibold">Saved Sessions</h3>
        </div>
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-lg font-semibold hover:text-foreground/80 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          Saved Sessions
          {sessions.length > 0 && (
            <span className="text-xs text-muted-foreground font-normal">
              ({sessions.length})
            </span>
          )}
        </button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onSaveSession} size="sm" className="h-8 w-8 p-0">
              <Save className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save current session</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="space-y-3">
          {/* Search */}
          {sessions.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                className="pl-9 h-8 text-xs"
              />
            </div>
          )}

          {/* Sessions List */}
          {filteredSessions.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-md">
              {sessions.length === 0
                ? "No saved sessions yet. Click the save button to store your current expression and context."
                : "No sessions match your search."}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSessions.map((session) => (
                <Card
                  key={session.id}
                  className="group hover:shadow-sm transition-shadow gap-2"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xs font-medium truncate">
                          {session.name}
                        </CardTitle>
                        {session.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {session.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLoadSession(session);
                              }}
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Load this session</p>
                          </TooltipContent>
                        </Tooltip>
                        {isSessionDifferent(session) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0 text-primary-600 hover:text-primary-600"
                                onClick={(e) =>
                                  handleUpdateSession(session.id, e)
                                }
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Update with current expression & context</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={(e) =>
                                handleDeleteSession(session.id, e)
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete session</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      <pre className="text-xs bg-muted/50 p-2 rounded text-muted-foreground font-mono whitespace-pre-wrap break-all">
                        {truncateExpression(session.expression)}
                      </pre>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDate(session.updatedAt)}</span>
                        {session.tags && session.tags.length > 0 && (
                          <div className="flex gap-1">
                            {session.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="bg-muted px-1 py-0.5 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {session.tags.length > 2 && (
                              <span className="text-muted-foreground">
                                +{session.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
