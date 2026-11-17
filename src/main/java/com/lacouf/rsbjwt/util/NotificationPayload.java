package com.lacouf.rsbjwt.util;

import com.lacouf.rsbjwt.model.ENUM.notifications.NotificationResourceType;
import org.jspecify.annotations.NonNull;

import java.util.HashMap;
import java.util.Map;

public final class NotificationPayload {
	private NotificationPayload() {}

	public static Map<String, Object> ViewResource(@NonNull NotificationResourceType type, Object id) {
		Map<String, Object> map = new HashMap<>();
		map.put("type", type);
		if(id != null) {
			map.put("id", id);
		}
		return map;
	}

	public static Map<String, Object> SendResource(@NonNull NotificationResourceType type) {
		Map<String, Object> map = new HashMap<>();
		map.put("type", type);
		return map;
	}
}
