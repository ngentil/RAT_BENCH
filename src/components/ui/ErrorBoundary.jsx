import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{padding:24,color:"#ff6b6b",fontFamily:"monospace",background:"#1a0000",border:"1px solid #ff3333",borderRadius:4,margin:16}}>
        <b>Render error:</b><br/>{this.state.error.message}<br/><pre style={{fontSize:10,marginTop:8,whiteSpace:"pre-wrap"}}>{this.state.error.stack}</pre>
      </div>
    );
    return this.props.children;
  }
}
export default ErrorBoundary;
