// AWM Integration for Roxy
// Import this in memory to have access to AWM functions

import { 
  getActiveProjects,
  queueWork,
  getPendingNotifications,
  isDaemonRunning,
  checkTodos,
  triggerReadyWork 
} from '~/clawd/awm/roxy-helpers';

/**
 * Quick reference for Roxy:
 * 
 * // Check what projects need work
 * const { shouldWork, reasons } = await checkTodos();
 * 
 * // Queue work for a specific project (non-blocking!)
 * await queueWork(projectId, 'high');
 * // Returns immediately, daemon picks it up in 5 seconds
 * 
 * // Auto-trigger ready work based on my judgment
 * const { queued, projects } = await triggerReadyWork();
 * 
 * // Check and send pending notifications
 * const notifications = await getPendingNotifications();
 * for (const n of notifications) {
 *   await message.send({ channel: 'discord', target: n.channel, message: n.message });
 * }
 * 
 * // Check daemon status
 * const running = await isDaemonRunning();
 * 
 * // Get all active projects
 * const projects = await getActiveProjects();
 */

export {
  getActiveProjects,
  queueWork,
  getPendingNotifications,
  isDaemonRunning,
  checkTodos,
  triggerReadyWork
};
