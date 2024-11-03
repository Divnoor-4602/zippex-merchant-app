class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDertvedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    this.setState(ErrorBoundary.getDertvedStateFromError(error));
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return (this.props as any).children;
  }
}
