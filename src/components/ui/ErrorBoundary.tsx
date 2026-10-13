import React from 'react';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="w-full max-w-4xl mx-auto px-4 py-12 relative z-10">
                    <div className="ui-panel p-16 flex flex-col items-center gap-6 text-center">
                        <p className="text-sm text-zinc-500">Something went wrong.</p>
                        <button
                            onClick={() => this.setState({ hasError: false })}
                            className="ui-btn"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
