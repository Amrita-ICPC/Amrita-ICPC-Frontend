import { StudentTeamClient } from "@/components/student/student-team-client";

export default function StudentTeamPage() {
    const initialParams = {
        page: 1,
        page_size: 12,
    };

    return (
        <div className="pt-2">
            <StudentTeamClient initialParams={initialParams} />
        </div>
    );
}
