package com.university.erp.config;

import com.university.erp.security.JwtUtils;
import com.university.erp.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CampusSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            UsernamePasswordAuthenticationToken user = authentication(accessor);
            if (user == null) {
                throw new AccessDeniedException("A valid session is required.");
            }
            accessor.setUser(user);
            return message;
        }
        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand()) || StompCommand.SEND.equals(accessor.getCommand())) {
            if (!(accessor.getUser() instanceof UsernamePasswordAuthenticationToken authentication)) {
                throw new AccessDeniedException("A valid session is required.");
            }
            if (StompCommand.SUBSCRIBE.equals(accessor.getCommand()) && isCampusTopic(accessor.getDestination()) && !operational(authentication)) {
                throw new AccessDeniedException("Campus state is limited to operational roles.");
            }
            if (StompCommand.SEND.equals(accessor.getCommand()) && isBroadcast(accessor.getDestination()) && !admin(authentication)) {
                throw new AccessDeniedException("Campus broadcasts are limited to admin.");
            }
        }
        return message;
    }

    private UsernamePasswordAuthenticationToken authentication(StompHeaderAccessor accessor) {
        String header = first(accessor.getNativeHeader("Authorization"));
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        String token = header.substring(7);
        if (!jwtUtils.validateToken(token)) {
            return null;
        }
        UserDetails user = userDetailsService.loadUserByUsername(jwtUtils.getUsernameFromToken(token));
        return new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
    }

    private static boolean operational(UsernamePasswordAuthenticationToken authentication) {
        return authentication.getAuthorities().stream().anyMatch(authority -> {
            String role = authority.getAuthority();
            return "ROLE_ADMIN".equals(role) || "ROLE_HOD".equals(role) || "ROLE_FACULTY".equals(role);
        });
    }

    private static boolean admin(UsernamePasswordAuthenticationToken authentication) {
        return authentication.getAuthorities().stream().anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    private static boolean isCampusTopic(String destination) {
        return destination != null && destination.startsWith("/topic/campus");
    }

    private static boolean isBroadcast(String destination) {
        return destination != null && destination.startsWith("/app/broadcast");
    }

    private static String first(List<String> values) {
        return values == null || values.isEmpty() ? null : values.get(0);
    }
}
