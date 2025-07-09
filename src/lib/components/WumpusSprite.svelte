<svg width="32" height="32" viewBox="0 0 32 32">
	<!-- Wumpus body (dark purple creature) -->
	<ellipse cx="16" cy="20" rx="12" ry="8" fill="#4a0e4e" stroke="#2a0a2e" stroke-width="2"/>
	
	<!-- Wumpus head -->
	<circle cx="16" cy="12" r="8" fill="#5a1e5e" stroke="#2a0a2e" stroke-width="2"/>
	
	<!-- Eyes -->
	<circle cx="12" cy="10" r="2" fill="#ff4444"/>
	<circle cx="20" cy="10" r="2" fill="#ff4444"/>
	
	<!-- Mouth/fangs -->
	<path d="M 12 16 Q 16 18 20 16" stroke="#ff4444" stroke-width="2" fill="none"/>
	<polygon points="14,16 15,18 13,18" fill="#ffffff"/>
	<polygon points="18,16 19,18 17,18" fill="#ffffff"/>
	
	<!-- Horns -->
	<polygon points="10,6 12,2 14,6" fill="#2a0a2e"/>
	<polygon points="18,6 20,2 22,6" fill="#2a0a2e"/>
	
	<!-- Claws -->
	<path d="M 6 22 L 4 26 M 8 24 L 6 28" stroke="#2a0a2e" stroke-width="2"/>
	<path d="M 26 22 L 28 26 M 24 24 L 26 28" stroke="#2a0a2e" stroke-width="2"/>
</svg>

<style>
	svg {
		filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.5));
	}
</style>
