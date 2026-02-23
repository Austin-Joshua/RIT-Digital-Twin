package com.rit.digitaltwin.aspect;

import com.rit.digitaltwin.model.AuditLog;
import com.rit.digitaltwin.repository.AuditLogRepository;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditLogAspect {

    private final AuditLogRepository auditLogRepository;

    // Intercept any create/update/delete method in the service layer
    @Pointcut("execution(* com.rit.digitaltwin.service.*.create*(..)) || " +
            "execution(* com.rit.digitaltwin.service.*.update*(..)) || " +
            "execution(* com.rit.digitaltwin.service.*.delete*(..)) || " +
            "execution(* com.rit.digitaltwin.service.*.approve*(..)) || " +
            "execution(* com.rit.digitaltwin.service.*.publish*(..))")
    public void auditableMethods() {
    }

    @AfterReturning(pointcut = "auditableMethods()", returning = "result")
    public void logAfterReturning(JoinPoint joinPoint, Object result) {
        try {
            String methodName = joinPoint.getSignature().getName();
            String className = joinPoint.getTarget().getClass().getSimpleName();

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser"))
                    ? auth.getName()
                    : "SYSTEM";

            AuditLog logEntry = AuditLog.builder()
                    .userEmail(userEmail)
                    .actionType(methodName)
                    .entityName(className.replace("Service", ""))
                    .details("Executed successfully with arguments: " + java.util.Arrays.toString(joinPoint.getArgs()))
                    .build();

            // Try to extract an ID if the returned object has one via reflection (simple
            // heuristic)
            if (result != null) {
                try {
                    java.lang.reflect.Method getIdMethod = result.getClass().getMethod("getId");
                    Object id = getIdMethod.invoke(result);
                    if (id != null) {
                        logEntry.setEntityId(id.toString());
                    }
                } catch (Exception e) {
                    // Ignore if no getId method
                }
            }

            auditLogRepository.save(logEntry);
            log.info("Audit log saved: {} performed {} on {}", userEmail, methodName, className);

        } catch (Exception e) {
            log.error("Failed to save audit log for {}", joinPoint.getSignature(), e);
        }
    }
}
